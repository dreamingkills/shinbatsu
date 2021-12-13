import rws from "reconnecting-websocket";
import ws from "ws";
import lastfm from "lastfm-typed";
import fs from "fs/promises";
import path from "path";

const apiKey = "e5310d1dbb33807f7217a58772bf4025";
const lfm = new lastfm(apiKey, {
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
  try {
    const rawKey = await fs.readFile(path.resolve(process.cwd(), "sessionkey"));
    const key = rawKey.toString();

    if (key && key.length === 32) {
      sessionKey = key;
      scrobbling = true;

      return;
    }
  } catch (e) {
    d("Did not find an existing session key!");
  }

  const token = await lfm.auth.getToken();
  const url = `https://www.last.fm/api/auth?api_key=${apiKey}&token=${token}`;

  console.log(
    `\nTo start using \u001b[35mShinbatsu\u001b[0m, please authorize with the following link!\n${url}\n`
  );

  const interval = setInterval(async () => {
    try {
      const session = await lfm.auth.getSession(token);
      sessionKey = session.key;

      await fs.writeFile(path.resolve(process.cwd(), "sessionkey"), sessionKey);

      scrobbling = true;
      clearInterval(interval);
      return;
    } catch (e) {
      d(e);
    }
  }, 5000);
};

let gameState: number | undefined;
socket.onmessage = async (event) => {
  const previousState = gameState;

  if (!scrobbling) return;
  const data = JSON.parse(event.data);

  // runs only on the first pass
  if (gameState === undefined) {
    console.log(
      `\u001b[35mShinbatsu\u001b[0m is listening!\nSongs will be scrobbled \u001b[4mupon beatmap completion\u001b[0m.\n`
    );

    gameState = data.menu.state;
    return;
  }

  // if the current game state is the same as the previous, there's no point in running the code again
  if (gameState === data.menu.state) return;
  gameState = data.menu.state;

  // 2 = Playing
  // 7 = Results Screen
  // 14 = Multiplayer Results Screen
  // see full list at https://github.com/Piotrekol/ProcessMemoryDataFinder/blob/master/OsuMemoryDataProvider/OsuMemoryStatus.cs
  if (![2, 7, 14].includes(gameState!)) return;

  let artist = data.menu.bm.metadata.artist;
  let track = data.menu.bm.metadata.title.replace(
    /(\(tv size\)|\(spee?d up ver\.?\)|\(cut ver\.?\))/gi,
    ``
  );
  let album: string | undefined;

  d(`Attempting to find Last.fm data for ${f(artist, track, album)}...`);

  try {
    const lfmTrack = await lfm.track.getInfo({ artist, track });

    album = lfmTrack.album?.title;
    d("Successfully found track data.");
  } catch (e) {
    d("Failed to find track data.");
  }

  if (gameState === 2) {
    d(`Attempting to set now playing to ${f(artist, track, album)}...`);

    // duration is necessary in order to clear the Now Playing in a timely manner
    let duration = Math.floor(data.menu.bm.time.mp3 / 1000);
    const isDT = data.menu.mods.str.includes("DT");
    const isHT = data.menu.mods.str.includes("HT");

    if (isDT) duration = duration / 1.5;
    if (isHT) duration = duration * 1.33;

    await lfm.track.updateNowPlaying(artist, track, sessionKey, {
      album,
      duration,
    });

    d(`Successfully updated now playing.`);
    return;
  } else if ([7, 14].includes(gameState!)) {
    // only scrobble if the user was playing
    // without this, it would scrobble when viewing scores w/o playing
    if (previousState !== 2) return;

    d(`Attempting to scrobble ${f(artist, track, album)}...`);

    const scrobble: {
      artist: string;
      track: string;
      album?: string;
      timestamp: number;
    } = {
      artist,
      track,
      timestamp: Math.floor(Date.now() / 1000),
    };

    // lastfm-typed will break if 'album' is set to undefined
    // temporary workaround until patch
    if (album) scrobble.album = album;

    try {
      await lfm.track.scrobble(sessionKey, [scrobble]);

      console.log(`Successfully scrobbled ${f(artist, track, album)}!`);
    } catch (e) {
      console.log(`Failed to scrobble ${f(artist, track, album)} :(`);

      d(e);
    }
  }
};

function f(artist: string, track: string, album: string | undefined): string {
  return `\u001b[35m${artist}\u001b[0m - ${track}${album ? ` (${album})` : ""}`;
}

function d(msg: any) {
  if (debug) console.log(msg);
}
