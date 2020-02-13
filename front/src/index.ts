import 'bootstrap';
import '@fortawesome/fontawesome-free/css/all.css';
import "/src/scss/main.scss";
// @ts-ignore
import $ from "jquery"

import JSONFormatter from 'json-formatter-js'

console.log("Hello");
console.log(process.env.NODE_ENV);

let obj = {
    "hello": "world",
};

let formatter = new JSONFormatter(obj);
document.querySelector("#wwr-chat-content").appendChild(formatter.render());
