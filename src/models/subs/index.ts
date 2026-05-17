import { createStore, createEvent, createEffect, UnitValue, StoreValue } from "effector";
import { resync } from "subtitle";

import { convertRawSubs } from "@src/utils/convertRawSubs";
import { $video } from "@src/models/videos";
import { getCurrentSubs } from "@src/utils/getCurrentSubs";
import type { Captions, TSub } from "../types";
import type Service from "@src/streamings/service";
import { $autoPause } from "../settings";

export const ES_CUSTOM_SUB_LABEL = "custom";
export const $rawSubs = createStore<Captions>([]);
export const $subs = $rawSubs.map((subtitle) => convertRawSubs(subtitle));
export const $subsLanguage = createStore<string>("auto");
export const $subsTitle = createStore<string>(null);
export const $currentSubs = createStore<TSub[]>([]);
export const $prevCurrentSubs = createStore<TSub[]>([]);
export const esSubsChanged = createEvent<string>();

export type TAvailableSub = {
  label: string;
  language: string;
  url?: string;
};
export const $availableSubs = createStore<TAvailableSub[]>([]);
export const availableSubsChanged = createEvent<TAvailableSub[]>();
$availableSubs.on(availableSubsChanged, (_, subs) => subs);

export const autoPauseFx = createEffect<
  {
    currentSubs: UnitValue<typeof $currentSubs>;
    video: UnitValue<typeof $video>;
    autoPause: StoreValue<typeof $autoPause>;
  },
  void
>(({ video }) => video.pause());

export const subsRequested = createEvent<string>();
export const subsReloadRequested = createEvent();
export const fetchSubs = createEvent<{ streaming: Service; language: string }>();
export const resetSubs = createEvent<string>();
export const fetchSubsFx = createEffect<{ streaming: Service; language: string }, Captions>(
  async ({ streaming, language }) => {
    try {
      return await streaming.getSubs(language);
    } catch (error) {
      console.error(error);
    }
  }
);
export const updateCurrentSubsFx = createEffect<{ subs: TSub[]; video: UnitValue<typeof $video>; keepSubtitleVisible: boolean }, TSub[]>(
  ({ subs, video, keepSubtitleVisible }) => {
    if (!video) return [];
    
    const time = video.currentTime * 1000;
    let currentSubs = getCurrentSubs(subs, time);
    
    if (currentSubs.length === 0 && keepSubtitleVisible) {
      let previousSub = null;
      const nextSubIndex = subs.findIndex((sub) => sub.start > time);
      if (nextSubIndex > 0) {
        previousSub = subs[nextSubIndex - 1];
      } else if (nextSubIndex === -1 && subs.length > 0) {
        previousSub = subs[subs.length - 1];
      }
      if (previousSub) {
        currentSubs = [previousSub];
      }
    }

    if (currentSubs.length > 0) {
      console.log("EasySubs: Current Subtitles:", currentSubs.map(s => s.cleanedText).join(" | "));
    } else if (subs.length > 0) {
      // Subtitles exist but none for current time
      // This is normal, but useful for debugging if it stays empty
    } else {
      console.debug("EasySubs: No subtitles available to display");
    }
    return currentSubs;
  }
);
export const updatePrevCurrentSubsFx = createEffect<TSub[], TSub[]>((subs) => subs);
export const rawSubsAdded = createEvent<Captions>();
export const updateCustomSubsFx = createEffect<Captions, Captions>((subs) => subs);

export const $subsDelay = createStore<number>(0);
export const subsDelayButtonPressed = createEvent<number>();
export const subsDelayChangeFx = createEffect<number, number>((value) => value);
export const subsResyncFx = createEffect<
  { rawSubs: Captions; subsDelay: StoreValue<typeof $subsDelay>; delay: number },
  Captions
>(({ rawSubs, subsDelay, delay }) => resync(rawSubs, (delay - subsDelay) * 1000));

export const subsLanguageDetectFx = createEffect<TSub[], string>(async (subs) => {
  try {
    return await chrome.runtime.sendMessage({
      type: "getTextLanguage",
      language: "en",
      text: subs[Math.floor(Math.random() * subs.length)].cleanedText,
    });
  } catch (error) {
    console.error(error);
  }
});
