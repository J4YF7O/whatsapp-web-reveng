import WAChatMessageStatus from "./WAChatMessageStatus";

export default class WAChatMessage {
    constructor(
        private _content: string,
        private _remoteJID: string = "",
        private id: string = "",
        private fromMe: boolean = false,
        private status: WAChatMessageStatus = WAChatMessageStatus.READ,
        private timestamp: number
    ){

    }
    public get content(): string {
        return this._content;
    }
    public get jid(): string {
        return this._remoteJID.split("@")[0];
    }
    static createFromJSON({status, message, key, messageTimestamp}: any): WAChatMessage {
        return new WAChatMessage(
            (message && "conversation" in message)?message.conversation: "N/A",
            key.remoteJid,
            key.id,
            key.fromMe,
            key.status,
            messageTimestamp
        );
    }
}
