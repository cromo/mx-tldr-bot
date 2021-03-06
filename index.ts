import { readFileSync } from "fs";
import * as fetch from "node-fetch";
import * as TOML from "@iarna/toml";
import { MatrixClient, AutojoinRoomsMixin, SimpleFsStorageProvider, IStorageProvider } from "matrix-bot-sdk";
import * as R from "ramda";

const defaultConfig = {
  homeserverUrl: "https://matrix.org",
  accessToken: "YOUR MATRIX TOKEN HERE",
  smmryApiKey: "YOUR SMMRY API KEY HERE",
  syncStateFile: "mx-tldr-bot.sync.json"
};

const envConfig = R.concat("MX_TLDR_BOT_");
const envConfigFor = R.compose(R.flip(R.prop)(process.env), envConfig);
const omitNilValues = R.pickBy(R.compose(R.not, R.isNil));
const mergeAllNonNil = R.compose(R.mergeAll, R.map(omitNilValues));
const getClient = R.pipe(R.constructN(3, MatrixClient), R.tap(AutojoinRoomsMixin.setupOnClient));
const readUtf8File = R.curryN(2, readFileSync)(R.__, {encoding: "utf-8"});
const readConfig = R.pipe(readUtf8File, TOML.parse);
const hasContent = R.compose(R.not, R.isNil, R.prop("content"));
const eventBody = R.path(["content", "body"]);
const startsWithBangCommand = command => R.pipe(eventBody, R.startsWith(`!${command}`));
const shouldRespond = R.allPass([hasContent, startsWithBangCommand("tldr")]);
const removeCommandPrefix = R.replace(/^!tldr\s*/, "");
const commandContent = R.pipe(eventBody, removeCommandPrefix);
const smmry = R.curry((apiKey, url) => fetch(`https://api.smmry.com?SM_API_KEY=${apiKey}&SM_URL=${url}`));
const toJson = R.invoker(0, "json");
const getSummary = apiKey => R.pipe(smmry(apiKey), R.then(toJson), R.then(R.prop("sm_api_content")));
const sendNotice = R.curry((client, roomId, message) => client.sendNotice(roomId, message));

const environmentConfig = {
  homeserverUrl: envConfigFor("HOMESERVER_URL"),
  accessToken: envConfigFor("ACCESS_TOKEN"),
  smmryApiKey: envConfigFor("SMMRY_API_KEY"),
  syncStateFile: envConfigFor("SYNC_STATE_FILE")
};

const config = mergeAllNonNil([
  defaultConfig,
  readConfig(R.defaultTo("config.toml", envConfigFor("CONFIG_FILE"))),
  environmentConfig
]);
const client = getClient(config.homeserverUrl, config.accessToken, new SimpleFsStorageProvider(config.syncStateFile));

client.start().then(() => console.log("Client started"));

client.on('room.message', (roomId: string, event: any) => {
  const notifyRoom = sendNotice(client, roomId);
  R.when(
    shouldRespond,
    R.pipe(
      commandContent,
      getSummary(config.smmryApiKey),
      R.then(notifyRoom),
      R.otherwise(R.thunkify(notifyRoom)(`Unable to get summary for ${commandContent(event)}`))
    ),
    event);
});