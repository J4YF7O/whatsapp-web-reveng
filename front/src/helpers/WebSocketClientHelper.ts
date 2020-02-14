import WebSocketMessageListener from "./WebSocketMessageListener";

export default class WebSocketClientHelper {
    private messageListeners: WebSocketMessageListener[] = [];
    private websocket: WebSocket | null = null;

    private _onCloseCallback: () => void;
    constructor(private websocketURL: string) {
    }
    public initializeWebsocket() {
        this.websocket = new WebSocket(this.websocketURL);
        this.websocket.onmessage = (messageEvent) => {
            // {{TAG}},{{json object string}}
            let messageData: string = messageEvent.data;
            let messageTag: string = messageData.split(",", 1)[0];
            if (messageTag && messageTag !== "") {
                let messageObject: any = JSON.parse(
                    // Remove {{TAG}}, | from messageData
                    messageData.substr(messageTag.length + 1)
                );
                this.messageListeners.filter(
                    listener => listener.successCondition(messageObject, messageTag)
                ).forEach((listener) => {
                    listener.successAction(messageObject, messageTag).then(() => {
                       if (! listener.keepAfterUse) this.removeMessageListener(listener);
                    });
                });
            }
            // ERROR ?
        };
    }
    set onCloseCallback(_closeCallback: () => void) {
        this._onCloseCallback = _closeCallback;
    }
    public addMessageListener(messageListener: WebSocketMessageListener) {
        this.messageListeners.push(messageListener);
    }
    public removeMessageListener(messageListener: WebSocketMessageListener) {
        this.messageListeners.splice(
            this.messageListeners.indexOf(messageListener),
            1
        );
    }

    call(messageObject: any) {
        if (!("type" in messageObject)) messageObject["type"] = "call";
        let messageTag = +new Date();
        this.websocket.send(
            `${messageTag},${JSON.stringify(messageObject)}`
        )
    }
}
