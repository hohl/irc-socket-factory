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
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path='./typing/node/node.d.ts'/>
///<reference path='./typing/irc-socket/irc-socket.d.ts'/>
var events = require("events");
var IrcSocket = require("irc-socket");
var net = require("net");
var NetSocket = net.Socket;
/**
 * This class handles multiple IRC sockets and keeps them online.
 *
 * @event ready
 * @event data
 * @event close
 * @event error
 */
var IrcSocketFactory = (function (_super) {
    __extends(IrcSocketFactory, _super);
    /**
     * Creates a new instance of IrcSocketFactory.
     */
    function IrcSocketFactory() {
        _super.call(this);
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
    IrcSocketFactory.prototype.createSocket = function (id, config) {
        var _this = this;
        if (this.sockets[id]) {
            throw new Error("You can't create a socket with an ID that is already in use!");
        }
        var ircSocket = this.sockets[id] = IrcSocket(config, new NetSocket());
        ircSocket.on("ready", function () { return _this.emit("ready", id); });
        ircSocket.on("data", function (message) { return _this.emit("data", id, message); });
        ircSocket.on("error", function (error) { return _this.emit("error", id, error); });
        ircSocket.on("close", function () {
            _this.sockets[id] = null;
            _this.emit("close", id);
        });
        ircSocket.connect();
        return ircSocket;
    };
    /**
     * Destroys the socket with the passed ID.
     *
     * @param id the unique identifier of the socket to close
     */
    IrcSocketFactory.prototype.destroySocket = function (id) {
        var ircSocket = this.sockets[id];
        if (!ircSocket) {
            return;
        }
        if (ircSocket.isReady()) {
            ircSocket.raw(["QUIT"]);
            setTimeout(function () {
                ircSocket.end();
            }, 250);
        }
        else {
            ircSocket.end();
            this.sockets[id] = null;
        }
    };
    return IrcSocketFactory;
})(events.EventEmitter);
exports.IrcSocketFactory = IrcSocketFactory;
//# sourceMappingURL=index.js.map