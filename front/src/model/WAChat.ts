import WAChatMessage from "./WAChatMessage";

export default class WAChat {
    constructor(
        private _jid: string,
        private _name: string | null,
        private timestamp: number | null = null,
        private _last_message: WAChatMessage | null = null,
        private _messages: WAChatMessage[] = []) {}

    get jid(): string {
        return this._jid.split("@")[0];
    }
    get name(): string {
        // TODO reformatad jid and print phone number instead.
        return (this._name)? this._name: this._jid
    }
    get last_message(): WAChatMessage {
        return this._last_message;
    }
    set last_message(obj: WAChatMessage) {
        this._last_message = obj;
    }
    private set_last_message(obj:any) {
        this.last_message = WAChatMessage.createFromJSON(obj);
    }
    public last_message_content() {
        return (this.last_message)?this.last_message.content:"N/A";
    }

}
