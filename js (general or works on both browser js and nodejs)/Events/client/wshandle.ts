import * as events from "../main"
export class WsHandleClient {
    get socket() {return this._ws}
    get ws() {return this._ws}
    get state() {return this._ws.readyState}
    readonly url:string
    private _ws!: WebSocket

    RECONNECT_TIMER:number=10000

    readonly message:events.EventSignal
    private readonly _message:events.BaseEvent

    constructor(url:string) {
        this.url = url

        this._message = new events.BaseEvent()
        this.message = this._message.Event

        this.reconnect()
    }

    send(...a:any[]) {
        if (this.state == 1 /* OPEN state */) {
            this._ws.send(JSON.stringify(Array.from(arguments)))
        }
    }

    reconnect() {
        this._ws = new WebSocket(this.url)

        this._ws.addEventListener("message", (event) => {
            try {
                let Data = JSON.parse(event.data)
                
                if (typeof(Data) == typeof([])) {
                    this._message.Fire(Data)
                }
            } catch (e){}
        })

        this._ws.addEventListener("close",() => {
            setTimeout(() => {
                this.reconnect()
            },this.RECONNECT_TIMER)
        })
    }

}
