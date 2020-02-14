export type WebsocketCondition = (obj: any, tag?: string) => boolean;
export const defaultWebsocketCondition = (obj: any, tag?: string) => true;
export type WebsocketAction = (obj: any, tag?: string) => Promise<boolean | void | any>;
export const defaultWebsocketAction = (obj: any, tag?: string) => new Promise<any>((resolve, reject) => {
    resolve(obj)
});


export default class WebSocketMessageListener {
    constructor(
        private _successCondition: WebsocketCondition = defaultWebsocketCondition,
        private _successAction: WebsocketAction = defaultWebsocketAction,
        private _keepAfterUse: boolean = false,
    ) {}
    get successCondition(): WebsocketCondition{
        return this._successCondition;
    }
    get successAction(): WebsocketAction{
        return this._successAction;
    }
    get keepAfterUse(): boolean {
        return this._keepAfterUse;
    }
}

