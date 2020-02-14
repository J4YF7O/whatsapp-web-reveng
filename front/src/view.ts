import exp = require("constants");

export let elements = {
    "loading": document.querySelector("#view-0"),
    "qrcode": document.querySelector("#view-1"),
    "messages": document.querySelector("#view-2"),
    "messagesLoader": document.querySelector("#wwr-chat-content-loader"),
    "messageChatContent": document.querySelector("#wwr-chat-content"),
    "messageChatContentList": document.querySelector("#wwr-chat-content-ul")
};

function isHidden(element: Element) {
    return element.classList.contains("d-none");
}

export function show(element: Element) {
    if (isHidden(element)) {
        element.classList.remove("d-none");
    }
}
export function hide(element: Element) {
    if (!isHidden(element)) {
        element.classList.add("d-none");
    }
}

export function showLoading() {
    hide(elements.qrcode);
    hide(elements.messages);
    show(elements.loading);
}
export function showQRCode() {
    hide(elements.loading);
    hide(elements.messages);
    show(elements.qrcode);
}
export function showMessages() {
    hide(elements.loading);
    hide(elements.qrcode);
    show(elements.messages);
}

export function updateQRCode(imageData) {
    let qrCodeContent = document.querySelector("#qrcode-content");
    (qrCodeContent).innerHTML = "";
    let image = document.createElement("img");
    image.setAttribute("src", imageData);
    qrCodeContent.append(image);
}
