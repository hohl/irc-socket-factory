/*
 *
 *          █████╗ ██╗     ██╗    ██╗ █████╗ ██╗   ██╗███████╗ ██████╗ ███╗   ██╗      ██╗██████╗  ██████╗
 *         ██╔══██╗██║     ██║    ██║██╔══██╗╚██╗ ██╔╝██╔════╝██╔═══██╗████╗  ██║██╗██╗██║██╔══██╗██╔════╝
 *         ███████║██║     ██║ █╗ ██║███████║ ╚████╔╝ ███████╗██║   ██║██╔██╗ ██║╚═╝╚═╝██║██████╔╝██║
 *         ██╔══██║██║     ██║███╗██║██╔══██║  ╚██╔╝  ╚════██║██║   ██║██║╚██╗██║██╗██╗██║██╔══██╗██║
 *         ██║  ██║███████╗╚███╔███╔╝██║  ██║   ██║   ███████║╚██████╔╝██║ ╚████║╚═╝╚═╝██║██║  ██║╚██████╗
 *         ╚═╝  ╚═╝╚══════╝ ╚══╝╚══╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝ ╚═════╝ ╚═╝  ╚═══╝      ╚═╝╚═╝  ╚═╝ ╚═════╝
 *
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Michael Hohl
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

///<reference path='./typing/node/node.d.ts'/>
///<reference path='./typing/irc-socket/irc-socket.d.ts'/>
import events = require("events");
import IrcSocket = require("irc-socket");
import net = require("net");
import NetSocket = net.Socket;

/**
 * This interface is expected as configuration once a new socket is created.
 *
 * {@see https://github.com/Havvy/irc-socket/blob/master/README.md}
 */
export interface IIrcConfig {
    port: number;
    server: string;
    nicknames: string[];
    username: string;
    realname: string;
    password?: string;
    proxy?: {
        password: string;
        username: string;
        hostname: string;
        ip: string;
    };
    capabilities?: {
        requires?: string[];
        wants?: string[];
    }
}

/**
 * A single IRC socket.
 *
 * {@see https://github.com/Havvy/irc-socket/blob/master/README.md}
 */
export interface IIrcSocket extends NodeJS.EventEmitter {
    /**
     * Sends a raw IRC command.
     *
     * @param data
     */
    raw(data:string[]):void;

    /**
     * This method will return true if the socket was ever started.
     *
     * @return {boolean}
     */
    isStarted():boolean;

    /**
     * This method will return true when the socket is started, but not ended. It will otherwise return false.
     *
     * @return {boolean}
     */
    isConnected():boolean;

    /**
     * This method will return true if the RPL_WELCOME message has been sent and the socket is still open. It will
     * otherwise return false.
     *
     * @return {boolean}
     */
    isReady():boolean;

    /**
     * Establishes a connection to the configured server.
     * Don't use this method directly. `IrcSocketFactory` already handles that for you.
     */
    connect():void;

    /**
     * Closes the connection.
     * Don't use this method directly. `IrcSocketFactory` already handles that for you.
     */
    end():void;
}

/**
 * This class handles multiple IRC sockets and keeps them online.
 *
 * @event ready
 * @event data
 * @event close
 * @event error
 */
export class IrcSocketFactory extends events.EventEmitter {

    /**
     * An associative array which keeps the managed sockets.
     */
    sockets:{ [index:string]:IIrcSocket };

    /**
     * Creates a new instance of IrcSocketFactory.
     */
    constructor() {
        super();
        this.sockets = {};
    }

    /**
     * Creates a new IRC socket with the passed configuration details.
     *
     * @param id an unique identifier which can be user for later retrieving of the socket
     * @param config configuration object which contains the connection details
     * @returns {IrcSocket}
     * @throws Error when trying to create a socket with an ID that is already in use
     */
    createSocket(id:string, config:IIrcConfig):IIrcSocket {
        if (this.sockets[id]) {
            throw new Error("You can't create a socket with an ID that is already in use!");
        }
        var ircSocket = this.sockets[id] = IrcSocket(config, new NetSocket());
        ircSocket.on("ready", () => this.emit("ready", id));
        ircSocket.on("data", (message:string) => this.emit("data", id, message));
        ircSocket.on("error", (error) => this.emit("error", id, error));
        ircSocket.on("close", () => {
            this.sockets[id] = null;
            this.emit("close", id);
        });
        ircSocket.connect();
        return ircSocket;
    }

    /**
     * Destroys the socket with the passed ID.
     *
     * @param id the unique identifier of the socket to close
     */
    destroySocket(id:string):void {
        var ircSocket = this.sockets[id];
        if (!ircSocket) {
            return;
        }
        if (ircSocket.isReady()) {
            ircSocket.raw(["QUIT"]);
            setTimeout(() => {
                ircSocket.end();
            }, 250);
        } else {
            ircSocket.end();
            this.sockets[id] = null;
        }
    }

}
