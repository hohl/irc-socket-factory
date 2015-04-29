///<reference path='../../typing/node/node.d.ts'/>

declare module "irc-socket" {
    interface IrcSocket extends NodeJS.EventEmitter {
        raw(data:string[]):void;
        connect():void;
        end():void;
        isStarted():boolean;
        isConnected():boolean;
        isReady():boolean;
        getRealname():string;
    }
    function e(config:any, socket?:any):IrcSocket;
    export = e;
}


