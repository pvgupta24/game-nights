/* =====================================================================
   game-nights · YouTube player helper (shared by quizboard + quizdeck)
   =====================================================================
   Every YouTube video or clip goes through the IFrame Player API, so the
   host sees what is happening: "loading", "playing", or a plain reason it
   can't play (removed, private, owner blocks embedding, no connection),
   instead of a silent "playing…" label over nothing.

   Load it in an event's index.html after the config and before the engine:
       <script src="../../engine/youtube.js"></script>
   ===================================================================== */

const YT_ERRORS = {
  2: "the video link is malformed",
  5: "this browser can't play the video",
  100: "the video was removed or made private",
  101: "the owner doesn't allow it to play outside YouTube",
  150: "the owner doesn't allow it to play outside YouTube",
  152: "the owner doesn't allow it to play outside YouTube",
  153: "open the board over http(s), not as a file, for YouTube to play",
};

let ytApiPromise = null;
function ytLoadApi() {
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve, reject) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { if (prev) prev(); resolve(window.YT); };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    s.onerror = () => { ytApiPromise = null; reject(new Error("YouTube unreachable")); };
    document.head.appendChild(s);
  });
  return ytApiPromise;
}

function ytWatchUrl(id, start) { return `https://www.youtube.com/watch?v=${id}&t=${start || 0}s`; }

/* Mount a player into `host` (emptied first) and start it.
   opts: { id, start, controls (default true), stallText, onStatus(kind, text) }
   kind: "loading" | "playing" | "paused" | "ended" | "stalled" | "error"
   Returns a handle: { stop() }. */
function ytMount(host, opts) {
  host.innerHTML = "";
  const slot = document.createElement("div");
  host.appendChild(slot);
  const status = (kind, text) => { if (opts.onStatus) opts.onStatus(kind, text); };
  let player = null, stopped = false, started = false;
  const watchdog = setTimeout(() => {
    if (!started && !stopped) status("stalled", opts.stallText || "hasn't started: press play on the video, or check the internet connection");
  }, 9000);
  status("loading", "loading…");

  ytLoadApi().then(YT => {
    if (stopped) return;
    player = new YT.Player(slot, {
      host: "https://www.youtube-nocookie.com",
      videoId: opts.id,
      playerVars: {
        start: Math.max(0, Math.floor(opts.start || 0)), autoplay: 1, rel: 0, modestbranding: 1,
        playsinline: 1, controls: opts.controls === false ? 0 : 1,
      },
      events: {
        onReady: e => { if (!stopped) e.target.playVideo(); },
        onStateChange: e => {
          if (e.data === YT.PlayerState.PLAYING) { started = true; clearTimeout(watchdog); status("playing", "playing"); }
          else if (e.data === YT.PlayerState.PAUSED) status("paused", "paused");
          else if (e.data === YT.PlayerState.ENDED) status("ended", "ended");
        },
        onError: e => { clearTimeout(watchdog); status("error", YT_ERRORS[e.data] || `YouTube error ${e.data}`); },
      },
    });
  }).catch(() => {
    if (stopped) return;
    clearTimeout(watchdog);
    status("error", "can't reach YouTube: check the internet connection");
  });

  return {
    stop() {
      stopped = true; clearTimeout(watchdog);
      try { if (player && player.destroy) player.destroy(); } catch (e) { }
      host.innerHTML = "";
    },
  };
}
