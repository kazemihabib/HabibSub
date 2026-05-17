import { parse, subTitleType } from "subtitle";
import { esSubsChanged } from "@src/models/subs";
import { esRenderSetings } from "@src/models/settings";
import Service from "./service";

class RaiPlay implements Service {
  name = "raiplay";

  private subCache: {
    [url: string]: subTitleType[];
  };

  constructor() {
    this.subCache = {};
    this.handleCaptionsData = this.handleCaptionsData.bind(this);

    setInterval(() => {
      const controlBar = document.querySelector(".vjs-control-bar");
      const easysubsSettings = document.querySelector(".es-settings");
      if (controlBar && !easysubsSettings) {
        esRenderSetings();
      }
    }, 100);
  }

  public init(): void {
    this.injectScript();
    window.addEventListener("esRaiPlayCaptionsData", this.handleCaptionsData as EventListener);
  }

  public async getSubs(url: string) {
    if (!url) return parse("");
    if (this.subCache[url]) return this.subCache[url];

    console.debug("EasySubs: RaiPlay fetching subs from", url);
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`Fetch failed with status ${resp.status}`);
      const text = await resp.text();
      const subs = parse(text);
      console.debug("EasySubs: RaiPlay parsed subs length", subs.length);
      this.subCache[url] = subs;
      return subs;
    } catch (e) {
      console.error("EasySubs: RaiPlay failed to fetch subs", e);
      return parse("");
    }
  }

  public getSubsContainer() {
    const selector = document.querySelector(".video-js") || document.querySelector("#player") || document.querySelector(".leaf__player") || document.querySelector("video")?.parentElement;
    console.debug("EasySubs: RaiPlay getSubsContainer", selector);
    if (selector === null || selector === undefined) throw new Error("Subtitles container not found");
    return selector as HTMLElement;
  }

  public getSettingsButtonContainer() {
    // Look specifically for the control bar's play button
    const controlBar = document.querySelector(".vjs-control-bar");
    const playButton = controlBar?.querySelector(".vjs-play-control");
    
    console.debug("EasySubs: RaiPlay getSettingsButtonContainer", { controlBar, playButton });
    
    if (playButton) return playButton as HTMLElement;
    if (controlBar) return controlBar.firstElementChild as HTMLElement;
    
    const fallback = document.querySelector(".vjs-play-control") || document.querySelector(".vjs-control-bar > *:first-child");
    console.debug("EasySubs: RaiPlay getSettingsButtonContainer fallback", fallback);
    return fallback as HTMLElement;
  }

  public getSettingsContentContainer() {
    const selector = document.querySelector(".video-js") || document.querySelector("#player") || document.querySelector(".leaf__player");
    if (selector === null) throw new Error("Settings content container not found");
    return selector as HTMLElement;
  }

  public isOnFlight() {
    return false;
  }

  private handleCaptionsData(event: CustomEvent): void {
    console.debug("EasySubs: RaiPlay captions data received", event.detail);
    // event.detail should be the subtitle URL
    esSubsChanged(event.detail);
  }

  private injectScript() {
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("assets/js/raiplay.js");
    script.type = "module";
    document.head.prepend(script);
  }
}

export default RaiPlay;
