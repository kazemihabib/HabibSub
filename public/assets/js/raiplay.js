let lastPath = window.location.pathname;
let checkCount = 0;
let isInitializing = false;

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
    const jsonUrl = window.location.href.split("?")[0].split("#")[0].replace(".html", ".json");
    console.debug("EasySubs: Trying JSON fallback", jsonUrl);
    return fetch(jsonUrl)
      .then((r) => {
        const contentType = r.headers.get("content-type");
        if (!r.ok || !contentType || !contentType.includes("application/json")) {
           throw new Error("Not a JSON response");
        }
        return r.json();
      })
      .then((data) => {
        const jsonSubs = data?.video?.subtitlesArray || data?.video?.subtitleList || [];
        return jsonSubs;
      })
      .catch((e) => {
        console.debug("EasySubs: JSON fallback skipped or failed", e.message);
        return [];
      });
  }

  return Promise.resolve(subs);
}

function dispatchSubs(subtitles) {
  if (subtitles && subtitles.length > 0) {
    const formattedSubs = subtitles.map(s => {
      const rawUrl = s.url.startsWith("http") ? s.url : `https://www.raiplay.it${s.url}`;
      return {
        label: s.label || s.language.toUpperCase(),
        language: s.language,
        url: encodeURI(rawUrl)
      };
    });

    console.log("EasySubs: RaiPlay available subtitles", formattedSubs);

    window.dispatchEvent(
      new CustomEvent("esRaiPlayAvailableSubs", {
        detail: formattedSubs,
      })
    );

    // WE NO LONGER AUTO-DISPATCH CaptionsData here.
    // User must select from the menu.
    return true;
  }
  return false;
}

async function init() {
  if (isInitializing) return;
  isInitializing = true;
  
  try {
    const subtitles = await getSubtitles();
    const success = dispatchSubs(subtitles);
    if (success) {
      isInitializing = false;
    } else {
      setTimeout(() => {
        isInitializing = false;
      }, 1000);
    }
  } catch (e) {
    console.error("EasySubs: RaiPlay init error", e);
    isInitializing = false;
  }
}

function handleNavigation() {
  console.log("EasySubs: RaiPlay navigation detected, resetting...");
  checkCount = 0;
  init();
}

if (document.readyState === "complete") {
  init();
} else {
  window.addEventListener("load", init);
}

const interval = setInterval(() => {
  if (window.location.pathname !== lastPath) {
    lastPath = window.location.pathname;
    handleNavigation();
  }

  if (checkCount < 20) {
    const hasSubs = document.querySelector("#es") || isInitializing;
    if (!hasSubs) {
      checkCount++;
      init();
    } else if (document.querySelector("#es")) {
      checkCount = 20; 
    }
  }
}, 1000);
