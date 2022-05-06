import * as ev from "../main"
import * as ws from "./wshandle"



export class RemoteEvent extends ev.BaseEvent {
    readonly url:string
    readonly handler!:ws.WsHandleClient
    constructor(url:string) {
        super()
        this.url = url
        this.handler = new ws.WsHandleClient(this.url)

        this.handler.message.then((...a:any[]) => {
            this.Recieve(Array.from(arguments))
        })
    }
    Fire(...a:any[]) {
        this.handler.send(Array.from(arguments))
    }
    private Recieve(...a:any[]):void {
        this.Event.Connections.filter(e => e.Disconnected == false).forEach((v,x) => {
            v.Callback(...Array.from(arguments))
        })
    }
}
