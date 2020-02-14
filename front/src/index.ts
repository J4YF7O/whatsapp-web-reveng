import 'bootstrap';
import '@fortawesome/fontawesome-free/css/all.css';
import "./scss/main.scss";
// @ts-ignore
import $ from "jquery"
import config from "./config";
import WebSocketClientHelper from "./helpers/WebSocketClientHelper";
import WebsocketStepWait from "./helpers/WebsocketStepWait";
import WebSocketMessageListener from "./helpers/WebSocketMessageListener";
import ListView from "./helpers/ListView";
import WAChat from "./model/WAChat";
import WAChatMessage from "./model/WAChatMessage";
import {showMessages, showLoading, showQRCode, updateQRCode, elements, show, hide} from "./view";

let clientWebsocket = new WebSocketClientHelper(config.API_URL);
let isClientLoggedIn: boolean;
let chatRequestResult: any = null;

let currentChatMessages: ListView<WAChatMessage> = new ListView<WAChatMessage>((message: WAChatMessage) => {
    let li = document.createElement("li");
    console.log("Look at my render :)");
    li.className = "list-group-item";
    li.innerHTML = `
        <div class="row">
            <div class="row">
                ${message.content}
            </div>
        </div>
        `;
    return li;
}, document.querySelector("#wwr-chat-content-ul"));


let chats: ListView<WAChat> = new ListView<any>((chat: WAChat) => {
    let li = document.createElement("li");
    li.className = "list-group-item wwr-chat-list";
    li.innerHTML = `
        <div class="row">
            <div class="col-3">
            </div>
            <div class="col-9">
                <div class="wwr-chat-title">
                ${chat.name}
                </div>
                <div class="wwr-chat-last-message text-sm-left text-black-50">
                    ${chat.last_message_content()}
                </div>
            </div>
        </div>`;
    li.addEventListener("click", (event: MouseEvent) => {
        getChatHistory(chat.jid_full)
    });
    return li;
}, document.querySelector("#wwr-chat-ul"));

function initializeModelVars() {
    isClientLoggedIn = false;
    chats.clear();
}
initializeModelVars();
function whatsAppConnectionLost(){
    showLoading();
    initializeModelVars();
    connectWhatsAppStep.run();
}

/**
 * ON WHATSAPP CONNECTION LOST
 */
clientWebsocket.addMessageListener(new WebSocketMessageListener(
    (obj, tag) =>
        "type"     in obj && obj.type     === "resource_gone" &&
        "from"     in obj && obj.from     === "api2client" &&
        "resource" in obj && obj.resource === "whatsapp",
    (obj, tag) => {
        return new Promise<any>((resolve, reject) => {
            whatsAppConnectionLost();
        });
    }, true
));

/**
 * ON WHATSAPP NEW MESSAGE
 */
clientWebsocket.addMessageListener(new WebSocketMessageListener(
    (obj, tag) =>
        "type"     in obj && obj.type     === "whatsapp_message_received" &&
        "from"     in obj && obj.from     === "api2client" &&
        "message"  in obj && obj.message,
    (obj, tag) => {
        return new Promise<any>((resolve, reject) => {
            resolve(obj);
            let message = obj.message;
            let messageType = obj.message[0];
            let messageInfos = obj.message[1];
            let messageData: Array<any> = obj.message[2];
            // On Login
            if (!isClientLoggedIn && messageType === "Conn") {
                isClientLoggedIn = true;
                showMessages();
                return;
            }
            switch (messageType) {
                case "response":
                    if ("type" in messageInfos) {
                        let responseType = messageInfos.type;
                        switch (responseType) {
                            // case "contacts":
                            //     break;
                            case "chat":
                                console.log("JE SUIS LAAAA");
                                chatRequestResult = messageData;
                                break;
                        }
                    }
                    break;
                case "action":
                    console.log("JE SUIS ICI", messageInfos);
                    if ("add" in messageInfos && messageInfos.add === "last") {
                        let __c: WAChat[] = [];
                        chatRequestResult.map((c) => c[1]).sort((ca, cb) => Number(cb.t) - Number(ca.t))
                            .forEach((chat) => {
                                __c.push(
                                    new WAChat(
                                        chat.jid,
                                        chat.name,
                                        chat.t
                                    )
                                )
                            });
                        messageData.forEach((last) => {
                            let last_message = WAChatMessage.createFromJSON(last);
                            let currentChatFilter = __c.filter((c) => {
                                return c.jid === last_message.jid
                            });
                            if (currentChatFilter && Array.isArray(currentChatFilter) && currentChatFilter.length > 0) {
                                let currentChat = currentChatFilter[0];
                                currentChat.last_message = last_message;
                            }
                        });
                        __c.forEach((c) => chats.add(c));
                        console.log(chats.all())
                    }
            }
        });
    }, true
));

let stepLoginAPI = new WebsocketStepWait(
        clientWebsocket,
        (webSocket) => {
            showLoading();
            webSocket.initializeWebsocket();
        }, new WebSocketMessageListener(
            (obj, tag) =>
                "type" in obj && "from" in obj &&
                obj.type === "connected" && obj.from === "api2client",
        (obj, tag) => {
                return new Promise<any>((resolve, reject) => {
                    resolve(obj)
                })
        }, true
    ),
);
stepLoginAPI.nextStep = new WebsocketStepWait(
    clientWebsocket,
    (webSocket) => {
        webSocket.call({
            command : "api-connectBackend",
            from: "client"
        });
    }, new WebSocketMessageListener(
        (obj, tag) =>
            "type"     in obj && obj.type === "resource_connected" &&
            "from"     in obj && obj.from === "api2client" &&
            "resource" in obj && obj.resource === "backend",
        (obj, tag) => {
            return new Promise<any>((resolve, reject) => {
                resolve(obj)
            })
        })
);
let connectWhatsAppStep = new WebsocketStepWait(
    clientWebsocket,
    (webSocket) => {
        webSocket.call({
            command : "backend-connectWhatsApp",
            from: "client"
        });
    }, new WebSocketMessageListener(
        (obj, tag) =>
            "type"     in obj && obj.type === "resource_connected" &&
            "from"     in obj && obj.from === "api2client" &&
            "resource" in obj && obj.resource === "whatsapp",
        (obj, tag) => {
            return new Promise<any>((resolve, reject) => {
                resolve(obj);
            })
        })
);
stepLoginAPI.nextStep.nextStep = connectWhatsAppStep;

connectWhatsAppStep.nextStep = new WebsocketStepWait(
    clientWebsocket,
    (webSocket) => {
        webSocket.call({
            command : "backend-generateQRCode",
            from: "client"
        });
    }, new WebSocketMessageListener(
        (obj, tag) =>
            "type"     in obj && obj.type === "generated_qr_code" &&
            "from"     in obj && obj.from === "api2client" &&
            "image"    in obj,
        (obj, tag) => {
            return new Promise<any>((resolve, reject) => {
                resolve(obj);
                updateQRCode(obj.image);
                showQRCode();
            })
        })
);
stepLoginAPI.run();

function getChatHistory(jid: string) {
     new WebsocketStepWait(
        clientWebsocket,
        (webSocket) => {
            show(elements.messagesLoader);
            hide(elements.messageChatContentList);
            webSocket.call({
                command : "backend-getChatHistory",
                jid: jid,
                from: "client"
            });
        }, new WebSocketMessageListener(
            (obj, tag) =>
                "type"     in obj && obj.type === "chat_history"    &&
                "jid"      in obj && obj.jid === jid                &&
                "messages" in obj && Array.isArray(obj.messages)
          , (obj, tag) => {
                return new Promise<any>((resolve, reject) => {
                    hide(elements.messagesLoader);
                    let element = obj.messages.sort(
                        (m, m1) => m.messageTimestamp - m1.messageTimestamp
                    );
                    element.forEach((m: any) => {
                        currentChatMessages.add(WAChatMessage.createFromJSON(m));
                    });
                    resolve(obj);
                    show(elements.messageChatContentList);
                    elements.messageChatContent.scrollTo(0, elements.messageChatContent.scrollHeight);

                    currentChatMessages.download("chat-" + obj.jid + ".json");
                })
            }
        )
    ).run()
}
