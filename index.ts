import { readFileSync } from "fs";
import * as fetch from "node-fetch";
import * as TOML from "@iarna/toml";

interface Config {
  smmryApiKey: string;
}

const config = getConfig("config.toml");

fetch(`https://api.smmry.com?SM_API_KEY=${config.smmryApiKey}&SM_URL=https://buzzdecafe.github.io/code/2014/05/16/introducing-ramda`)
    .then(res => res.json())
    .then(body => console.log(body));

function getConfig(filename: string) {
  return TOML.parse(readFileSync(filename, {encoding: "utf-8"})) as unknown as Config;
}