import { Parser } from "m3u8-parser";
import { esRenderSetings } from "@src/models/settings";
import Service from "./service";
import { parse } from "subtitle";
import { esSubsChanged, rawSubsAdded } from "@src/models/subs";
import { $video } from "@src/models/videos";

class VixCloud implements Service {
  name = "vixcloud";
  private videoPlaylistUrl: string | undefined;
  private subsName: string | undefined;

  constructor() {
    this.handleVixCloudPlaylist = this.handleVixCloudPlaylist.bind(this);
    this.handleVixCloudCaptionsChanged = this.handleVixCloudCaptionsChanged.bind(this);

    waitForElement("#player video", () => {
      esRenderSetings();
    });
  }

  public init(): void {
    this.injectScript();
    window.addEventListener("esVixCloudPlaylist", this.handleVixCloudPlaylist as EventListener);
    window.addEventListener("esVixCloudCaptionsChanged", this.handleVixCloudCaptionsChanged as EventListener);
  }

  public async getSubs(label: string) {
    if (!label || label === "off") return parse("");
    if (!this.videoPlaylistUrl) return parse("");

    console.debug("EasySubs: Fetching full subs for", label, "from", this.videoPlaylistUrl);

    const url = new URL(this.videoPlaylistUrl);
    const resp = await fetch(this.videoPlaylistUrl);
    const data = await resp.text();
    const parser = new Parser();
    parser.push(data);
    parser.end();

    const subsMedia = parser.manifest.mediaGroups.SUBTITLES;
    if (!subsMedia) return parse("");

    // Find the track that matches the label
    const subGroup = Object.values(subsMedia).find((group) => group[label]);
    if (!subGroup) return parse("");

    const subUri = subGroup[label].uri;
    const fullSubUri = subUri.startsWith("http") ? subUri : `${url.origin}${subUri}`;

    const subsSegmentsResp = await fetch(fullSubUri);
    const subsSegmentsData = await subsSegmentsResp.text();

    const subsSegmentsParser = new Parser();
    subsSegmentsParser.push(subsSegmentsData);
    subsSegmentsParser.end();

    let allVttContent = "WEBVTT\n\n";
    for (const segment of subsSegmentsParser.manifest.segments) {
      const segmentUri = segment.uri.startsWith("http") ? segment.uri : `${fullSubUri.substring(0, fullSubUri.lastIndexOf("/") + 1)}${segment.uri}`;
      const segmentResp = await fetch(segmentUri);
      const segmentData = await segmentResp.text();
      // Remove WEBVTT header from segments except the first one if we are merging
      allVttContent += segmentData.replace("WEBVTT\n\n", "").replace("WEBVTT\n", "") + "\n";
    }

    return parse(allVttContent);
  }

  private handleVixCloudPlaylist(event: CustomEvent) {
    this.videoPlaylistUrl = event.detail;
    console.debug("EasySubs: Playlist received", this.videoPlaylistUrl);
    if (this.subsName) {
      esSubsChanged(this.subsName);
    }
  }

  private handleVixCloudCaptionsChanged(event: CustomEvent) {
    this.subsName = event.detail;
    esSubsChanged(this.subsName);
  }

  private injectScript() {
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("assets/js/vixcloud.js");
    script.type = "module";
    document.head.prepend(script);
  }

  public getSubsContainer() {
    const selector = document.querySelector("#player");
    if (selector === null) throw new Error("Subtitles container not found");
    return selector as HTMLElement;
  }

  public getSettingsButtonContainer() {
    const selector = document.querySelector(".jw-icon-playback")?.parentElement;
    if (selector === null) throw new Error("Settings button container not found");
    return selector as HTMLElement;
  }

  public getSettingsContentContainer() {
    const selector = document.querySelector(".jw-wrapper") || document.querySelector("#player");
    if (selector === null) throw new Error("Settings content container not found");
    return selector as HTMLElement;
  }

  public isOnFlight() {
    return false;
  }
}

function getText(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent || "";
  }
  if (node.nodeName === "BR") {
    return "\n";
  }

  const result = Array.from(node.childNodes)
    .map((el) => getText(el))
    .join("");
  return result;
}

function waitForElement(selector: string, callBack: () => void) {
  window.setTimeout(function () {
    const element = document.querySelector(selector);
    if (element) {
      callBack();
    } else {
      waitForElement(selector, callBack);
    }
  }, 300);
}

export default VixCloud;
