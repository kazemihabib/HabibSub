function getSubtitles() {
  const context = window.WashiContext || {};
  const video = context.video || {};
  let subs = video.subtitlesArray || video.subtitleList || [];

  if (subs.length === 0 && video.attributes) {
    // Check for stl_it, stl_en etc in attributes
    Object.keys(video.attributes).forEach((key) => {
      if (key.startsWith("stl_")) {
        subs.push({
          language: key.replace("stl_", ""),
          label: key.replace("stl_", "").toUpperCase(),
          url: video.attributes[key],
        });
      }
    });
  }

  // Also check if we can find subtitles in the JSON file if WashiContext is minimal
  if (subs.length === 0) {
    console.log("EasySubs: Subtitles not found in WashiContext, trying JSON fallback");
    const jsonUrl = window.location.href.split("?")[0].split("#")[0].replace(".html", ".json");
    fetch(jsonUrl)
      .then((r) => r.json())
      .then((data) => {
        const jsonSubs = data?.video?.subtitlesArray || data?.video?.subtitleList || [];
        if (jsonSubs.length > 0) {
          console.log("EasySubs: Subtitles found in JSON fallback", jsonSubs);
          dispatchSubs(jsonSubs);
        }
      })
      .catch((e) => console.error("EasySubs: Failed to fetch fallback JSON", e));
  }

  return subs;
}

function dispatchSubs(subtitles) {
  if (subtitles.length > 0) {
    // Prioritize Italian, otherwise take the first one
    const sub = subtitles.find((s) => s.language === "it") || subtitles[0];
    const rawUrl = sub.url.startsWith("http") ? sub.url : `https://www.raiplay.it${sub.url}`;
    const fullUrl = encodeURI(rawUrl);

    console.log("EasySubs: Selected RaiPlay subtitle", sub.label, fullUrl);

    window.dispatchEvent(
      new CustomEvent("esRaiPlayCaptionsData", {
        detail: fullUrl,
      })
    );
  }
}

function init() {
  const subtitles = getSubtitles();
  console.log("EasySubs: RaiPlay subtitles found", subtitles);
  dispatchSubs(subtitles);
}

// Since RaiPlay might load content dynamically, we might need to wait or observe
if (document.readyState === "complete") {
  init();
} else {
  window.addEventListener("load", init);
}

// Also check for changes in WashiContext if it's a SPA
let lastPath = window.location.pathname;
let checkCount = 0;
const interval = setInterval(() => {
  if (window.location.pathname !== lastPath) {
    lastPath = window.location.pathname;
    init();
  }

  // If WashiContext was missing at load, try a few more times
  if (!window.WashiContext && checkCount < 10) {
    checkCount++;
    init();
  } else if (checkCount < 10) {
    // Context found, we can stop the aggressive check but keep the path check
    checkCount = 10;
  }
}, 1000);
