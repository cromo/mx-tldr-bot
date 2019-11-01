import * as fetch from "node-fetch";

const smmryApiKey = "";

fetch(`https://api.smmry.com?SM_API_KEY=${smmryApiKey}&SM_URL=https://buzzdecafe.github.io/code/2014/05/16/introducing-ramda`)
    .then(res => res.json())
    .then(body => console.log(body));