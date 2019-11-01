import { readFileSync } from "fs";
import * as fetch from "node-fetch";
import * as TOML from "@iarna/toml";
import { MatrixClient, AutojoinRoomsMixin, SimpleFsStorageProvider, IStorageProvider } from "matrix-bot-sdk";
import * as R from "ramda";

interface Config {
  homeserverUrl: string;
  accessToken: string;
  smmryApiKey: string;
};

const config = getConfig("config.toml");
const client = getClient(config.homeserverUrl, config.accessToken, new SimpleFsStorageProvider("sync.json"));

const hasContent = event => !!event.content;
const eventBody = R.path(["content", "body"]);
const startsWithBangCommand = command => event => event.content.body.startsWith(`!${command}`);
const shouldRespond = R.allPass([hasContent, startsWithBangCommand("tldr")]);
const getCommandContent = R.replace(/^!tldr\s*/, "");
const smmry = url => fetch(`https://api.smmry.com?SM_API_KEY=${config.smmryApiKey}&SM_URL=${url}`);
const toJson = res => res.json();
const getSummary = R.pipe(smmry, R.then(toJson), R.then(R.prop("sm_api_content")));
const sendNotice = R.curry((client, roomId, message) => client.sendNotice(roomId, message));

client.start().then(() => console.log("Client started"));

client.on('room.message', async (roomId: string, event: any) => {
  R.when(
    shouldRespond,
    R.pipe(
      eventBody,
      getCommandContent,
      getSummary,
      R.then(sendNotice(client, roomId)),
      R.otherwise(R.thunkify(sendNotice)(client, roomId, `Unable to get summary for ${R.pipe(eventBody, getCommandContent)(event)}`))
    ),
    event);
});

function getConfig(filename: string) {
  return TOML.parse(readFileSync(filename, {encoding: "utf-8"})) as unknown as Config;
}

function getClient(homeserverUrl: string, accessToken: string, storageProvider: IStorageProvider) {
  const client = new MatrixClient(homeserverUrl, accessToken, storageProvider);
  AutojoinRoomsMixin.setupOnClient(client);
  return client;
}
