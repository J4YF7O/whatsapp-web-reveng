import WebSocketStep from "./WebSocketStep";
import WebSocketMessageListener, {WebsocketCondition} from "./WebSocketMessageListener";
import WebSocketClientHelper from "./WebSocketClientHelper";

export default class WebsocketStepWait extends WebSocketStep {


    constructor(
        webSocket: WebSocketClientHelper,
        action: (webSocket: WebSocketClientHelper) => (any | void),
        messageListener: WebSocketMessageListener,
        nextStep: WebSocketStep | null = null,
    ) {
        super(webSocket, action, messageListener, nextStep);
    }

    run(timeout: number = 1000): Promise<any> {
        return new Promise<any>((resolve, rejects) => {
            super.run().then(() => {
                let webSocketMessageListener = new WebSocketMessageListener(
                    this.messageListener.successCondition,
                    (obj: any, tag?: string) => {
                        console.log("_sucessAction in stepWait", this.messageListener);
                        return this.messageListener.successAction(obj, tag).then(() => {
                            console.log("Je suis dans la promessse", this.nextStep);
                            if (this.nextStep) this.nextStep.run();
                            resolve(obj);
                        });
                    }
                );
                this.webSocket.addMessageListener(webSocketMessageListener);
            })
        });

    }
}
