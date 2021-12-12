import rws from "reconnecting-websocket";
import ws from "ws";
import lastfm from "lastfm-typed";
import fs from "fs/promises";

const lfm = new lastfm("e5310d1dbb33807f7217a58772bf4025", {
  apiSecret: "09d64e9671521726fea70820e9c791a1",
  userAgent: "dreamingkills/shinbatsu",
});
let sessionKey: string;

const debug = false;
let scrobbling = false;

const socket = new rws("ws://127.0.0.1:24050/ws", [], {
  WebSocket: ws,
  connectionTimeout: 1000,
  maxRetries: 10,
});

socket.onopen = async () => {
  let config: { sessionkey: string };

  try {
    const rawConfig = await fs.readFile("./config.json");
    config = JSON.parse(rawConfig.toString()) as {
      sessionkey: string;
    };
  } catch (e) {
    config = { sessionkey: "" };
  }

  if (config.sessionkey) {
    if (debug)
      console.log(`Session key found in config.json, skipping auth flow...`);

    sessionKey = config.sessionkey;

    scrobbling = true;
    return;
  }

  if (debug) console.log(`No session key found, initiating auth flow...`);

  const token = await lfm.auth.getToken();
  const url = `https://www.last.fm/api/auth?api_key=e5310d1dbb33807f7217a58772bf4025&token=${token}`;

  console.log(
    `\nTo start using \u001b[35mShinbatsu\u001b[0m, please authorize with the following link!\n${url}\n`
  );

  const interval = setInterval(async () => {
    try {
      const session = await lfm.auth.getSession(token);
      sessionKey = session.key;

      await fs.writeFile(
        "./config.json",
        JSON.stringify({ sessionkey: sessionKey })
      );

      scrobbling = true;
      clearInterval(interval);
      return;
    } catch (e) {
      if (debug) console.log(`Poll failed - user has not yet authorized`);
      // do nothing
    }
  }, 5000);
};

let gameState: number | undefined;
socket.onmessage = async (event) => {
  if (!scrobbling) return;

  const data = JSON.parse(event.data);

  let isInitialState =
    gameState === undefined && gameState !== 7 && gameState !== 14;

  if (gameState === data.menu.state) return;
  gameState = data.menu.state;

  if (isInitialState) {
    if (debug) console.log("Passing scrobble due to initial state...");
    console.log(
      `\u001b[35mShinbatsu\u001b[0m is listening!\nSongs will be scrobbled \u001b[4mupon beatmap completion\u001b[0m.\n`
    );
    return;
  }

  if (gameState !== 7 && gameState !== 14) {
    if (debug)
      console.log("Passing scrobble due to non-result state change...");
    return;
  }

  let { artist, title }: { artist: string; title: string } =
    data.menu.bm.metadata;
  title = title
    .replace(/(\(tv size\)|\(spee?d up ver\.?\)|\(cut ver\.?\))/gi, ``)
    .trim();

  try {
    await lfm.track.scrobble(sessionKey, [
      { artist, track: title, timestamp: Math.floor(Date.now() / 1000) },
    ]);

    console.log(
      `Successfully scrobbled \u001b[35m${artist}\u001b[0m - ${title}!`
    );
  } catch (e) {
    console.error(e);
  }
};
