import WebSocketClientHelper from './WebSocketClientHelper';
import WebSocketMessageListener from "./WebSocketMessageListener";

export default class WebSocketStep {
    public constructor(
        protected  webSocket:       WebSocketClientHelper,
        protected  action:          (webSocket: WebSocketClientHelper) => any | void,
        protected  messageListener: WebSocketMessageListener,
        protected  _nextStep:       WebSocketStep | null = null,
    ) {

    }
    public set nextStep(nextStep: WebSocketStep){
        this._nextStep = nextStep;
    }
    public get nextStep(): WebSocketStep| null{
        return this._nextStep;
    }
    public run(timeout: number = 1000): Promise<WebSocketStep | void > {
        if (this.action) this.action(this.webSocket);
        return new Promise<void>((resolve) => {
            resolve()
        });
    }
}
