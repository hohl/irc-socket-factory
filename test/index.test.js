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
///<reference path='../typing/chai/chai.d.ts'/>
///<reference path='../typing/irc-socket/irc-socket.d.ts'/>
///<reference path='../typing/mocha/mocha.d.ts'/>
///<reference path='../typing/node/node.d.ts'/>
var chai = require("chai");
var expect = chai.expect;
var irc = require("../index");
var IrcSocketFactory = irc.IrcSocketFactory;
var factory = new IrcSocketFactory();
var socket;
describe("IrcSocketFactory#createSocket(id,config)", function () {
    it("should create a new IRC socket", function () {
        socket = factory.createSocket("test", {
            server: "irc.freenode.net",
            port: 6667,
            nicknames: ["mocha42", "testing37", "travisBot"],
            username: "sorry123",
            realname: "Mocha Unit Test"
        });
        expect(socket).to.not.be.null;
    });
    it("should trigger connect", function () {
        expect(socket.isStarted()).to.equal(true);
    });
    it("should forward `ready` event", function (done) {
        factory.once("ready", function (id) {
            try {
                expect(id).to.equal("test");
                done();
            }
            catch (exception) {
                done(exception);
            }
        });
        socket.emit("ready");
    });
    it("should forward `data` event", function (done) {
        factory.once("data", function (id, message) {
            try {
                expect(id).to.equal("test");
                expect(message).to.equal("message");
                done();
            }
            catch (exception) {
                done(exception);
            }
        });
        socket.emit("data", "message");
    });
    // this test is disables since "close" would destroy the client, but we need it in further tests
    /*it("should forward `close` event", (done:(error?:Error) => void) => {

        factory.once("close", (id:string) => {
            try {
                expect(id).to.equal("test");
                done();
            } catch (exception) {
                done(exception);
            }
        });
        socket.emit("close");
    });*/
    it("should forward `error` event", function (done) {
        factory.once("error", function (id, reason) {
            try {
                expect(id).to.equal("test");
                expect(reason).to.equal("reason");
                done();
            }
            catch (exception) {
                done(exception);
            }
        });
        socket.emit("error", "reason");
    });
    it("should prevent reusing an existing ID", function () {
        expect(function () { return factory.createSocket("test", null); }).to.throw("You can't create a socket with an ID that is already in use!");
    });
});
describe("IrcSocketFactory#sockets", function () {
    it("should hold the socket by it's id", function () {
        expect(factory.sockets["test"]).to.not.be.null;
        expect(factory.sockets["test"]).to.equal(socket);
    });
});
describe("IrcSocketFactory#destroySocket(id)", function () {
    it("should kill the socket", function (done) {
        factory.destroySocket("test");
        setTimeout(function () {
            try {
                expect(factory.sockets["test"]).to.be.null;
                done();
            }
            catch (exception) {
                done(exception);
            }
        }, 500);
    });
    it("should ignore requests on invalid ids", function () {
        factory.destroySocket("invalid");
    });
});
//# sourceMappingURL=index.test.js.map