# mx-tldr-bot 😩🤖

A chat bot for [Matrix](https://matrix.org/) servers that posts the summary of a given article using [SMMRY](https://smmry.com/).

## User Interface

When in a matrix chat with mx-tldr-bot, send a message in this format:

```
!tldr <url>
```

e.g.

```
!tldr https://repl.it/site/blog/upm
```

## Installation

You'll need node.js installed.

```bash
git clone https://github.com/cromo/mx-tldr-bot.git
cd mx-tldr-bot
cp config.example.toml config.toml
$EDITOR config.toml
npm install
npm start
```

Docker container Coming Soon™

## Configuration

mx-tldr-bot can be configured by editing `config.toml` or via environment variables.

### `config.toml`

- `homeserverUrl` *optional* - the homeserver of the account the bot will use. Defaults to `"https://matrix.org"`.
- `accessToken` - the access token to authenticate the bot. See [T2Bot's documentation for how to get an access token](https://t2bot.io/docs/access_tokens/).
- `smmryApiKey` - the API key for SMMRY.

### Environment variables

- `MX_TLDR_BOT_CONFIG_FILE` - specifies the location of `config.toml`.
- `MX_TLDR_BOT_HOMESERVER_URL` - same as `homeserverUrl` in `config.toml`.
- `MX_TLDR_BOT_ACCESS_TOKEN` - same as `accessToken` in `config.toml`.
- `MX_TLDR_BOT_SMMRY_API_KEY` - same as `smmryApiKey` in `config.toml`.

## License

ISC