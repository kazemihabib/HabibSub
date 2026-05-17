import { createEffect, UnitValue, sample, split } from "effector";
import {
  $currentSubs,
  $rawSubs,
  $subs,
  $subsDelay,
  esSubsChanged,
  fetchSubsFx,
  resetSubs,
  subsDelayButtonPressed,
  subsDelayChangeFx,
  subsRequested,
  subsResyncFx,
  updateCurrentSubsFx,
  updateCustomSubsFx,
  autoPauseFx,
  $subsLanguage,
  subsLanguageDetectFx,
  $subsTitle,
  subsReloadRequested,
  ES_CUSTOM_SUB_LABEL,
  rawSubsAdded,
} from ".";
import { $streaming } from "../streamings";
import { $video, videoTimeUpdate } from "../videos";
import { 
  $autoPause, 
  $playbackMode, 
  $autoResume,
  $resumeDelay,
  $repeatCount,
  $pauseAfterRepeat,
  $repeatMarginStart,
  $repeatMarginEnd,
  $keepSubtitleVisible,
  TPlaybackMode 
} from "../settings";
import { debug } from "patronum";
import type { TSub } from "../types";

// State to track repeat counts
let currentRepeatCount = 0;
let lastVideoTime = -1;
let isProgrammaticSeek = false;
let activeSubForRepeat: TSub | null = null;
let candidateSubForRepeat: TSub | null = null;
let completedSubForRepeat: TSub | null = null;

const autoResumeFx = createEffect<{ video: HTMLVideoElement; delaySeconds: number }, void>(async ({ video, delaySeconds }) => {
  await new Promise((resolve) => setTimeout(resolve, delaySeconds * 1000));
  video.play();
});

split({
  source: esSubsChanged,
  match: {
    hasLanguage: (language) => !!language,
    noLanguage: (language) => !language,
  },
  cases: {
    hasLanguage: subsRequested,
    noLanguage: resetSubs,
  },
});

sample({
  clock: subsRequested,
  source: $streaming,
  filter: (_, language) => language != ES_CUSTOM_SUB_LABEL,
  fn: (streaming, language) => ({ streaming, language }),
  target: fetchSubsFx,
});

sample({
  clock: [videoTimeUpdate, $rawSubs, $keepSubtitleVisible],
  source: { subs: $subs, video: $video, keepSubtitleVisible: $keepSubtitleVisible },
  fn: ({ subs, video, keepSubtitleVisible }, _) => ({ subs, video, keepSubtitleVisible }),
  target: updateCurrentSubsFx,
});

sample({
  clock: videoTimeUpdate,
  source: { 
    currentSubs: $currentSubs, 
    video: $video, 
    playbackMode: $playbackMode, 
    autoResume: $autoResume,
    resumeDelay: $resumeDelay,
    repeatCount: $repeatCount,
    pauseAfterRepeat: $pauseAfterRepeat,
    repeatMarginStart: $repeatMarginStart,
    repeatMarginEnd: $repeatMarginEnd,
  },
  filter: ({ currentSubs, video, playbackMode, repeatMarginEnd }) => {
    if (!video) return false;
    const currentTime = video.currentTime * 1000;
    
    if (lastVideoTime !== -1) {
      const timeDiff = currentTime - lastVideoTime;
      // If time difference is greater than 1000ms, it's a seek
      if (Math.abs(timeDiff) > 1000) {
        if (!isProgrammaticSeek) {
          activeSubForRepeat = null;
          candidateSubForRepeat = null;
          completedSubForRepeat = null;
          currentRepeatCount = 0;
        } else {
          isProgrammaticSeek = false;
        }
      }
    }
    lastVideoTime = currentTime;

    if (playbackMode === "pause" && currentSubs[0]) {
      const adjustedEnd = currentSubs[0].end;
      const timeToEnd = adjustedEnd - currentTime;
      return timeToEnd < 250 && timeToEnd > 0;
    }

    if (playbackMode === "repeat") {
      if (currentSubs[0]) {
        candidateSubForRepeat = currentSubs[0];
      }

      const subToCheck = activeSubForRepeat || candidateSubForRepeat;
      if (subToCheck) {
        // If we are not actively repeating, and we have already completed this sub, skip it
        if (!activeSubForRepeat && completedSubForRepeat && completedSubForRepeat.id === subToCheck.id) {
          return false;
        }

        const safeMarginEnd = Number(repeatMarginEnd) || 0;
        const adjustedEnd = subToCheck.end + safeMarginEnd;
        const timeToEnd = adjustedEnd - currentTime;
        
        // If we've passed the adjusted end, clear candidates so we don't get stuck
        if (timeToEnd < -500) {
          candidateSubForRepeat = null;
          return false;
        }

        return timeToEnd < 250 && timeToEnd > 0;
      }
    }
    return false;
  },
  target: createEffect<
    { 
      currentSubs: UnitValue<typeof $currentSubs>; 
      video: UnitValue<typeof $video>; 
      playbackMode: TPlaybackMode; 
      autoResume: boolean;
      resumeDelay: number;
      repeatCount: number;
      pauseAfterRepeat: boolean;
      repeatMarginStart: number;
      repeatMarginEnd: number;
    },
    void
  >(async ({ video, playbackMode, autoResume, resumeDelay, currentSubs, repeatCount, pauseAfterRepeat, repeatMarginStart }) => {
    if (playbackMode === "repeat") {
      const subToRepeat = activeSubForRepeat || candidateSubForRepeat;
      if (!subToRepeat) return;
      
      if (!activeSubForRepeat) {
        activeSubForRepeat = subToRepeat;
        currentRepeatCount = 0;
      }
      
      if (currentRepeatCount < repeatCount) {
        currentRepeatCount++;
        isProgrammaticSeek = true;
        const safeMarginStart = Number(repeatMarginStart) || 0;
        let targetTime = (subToRepeat.start - safeMarginStart) / 1000;
        if (isNaN(targetTime) || targetTime < 0) targetTime = 0;
        video.currentTime = targetTime;
        video.play();
      } else {
        if (pauseAfterRepeat) {
          video.pause();
        }
        completedSubForRepeat = activeSubForRepeat;
        activeSubForRepeat = null;
        candidateSubForRepeat = null;
        currentRepeatCount = 0;
      }
    } else if (playbackMode === "pause") {
      video.pause();
      if (autoResume) {
        autoResumeFx({ video, delaySeconds: resumeDelay });
      }
    }
  }),
});

sample({
  clock: subsDelayButtonPressed,
  target: subsDelayChangeFx,
});

sample({
  clock: subsDelayButtonPressed,
  source: { rawSubs: $rawSubs, subsDelay: $subsDelay },
  fn: ({ rawSubs, subsDelay }, delay) => ({ rawSubs, subsDelay, delay }),
  target: subsResyncFx,
});

sample({
  clock: $subs,
  filter: (subs) => subs.length > 0,
  target: subsLanguageDetectFx,
});

sample({
  clock: subsReloadRequested,
  source: { subsTitle: $subsTitle, rawSubs: $rawSubs },
  filter: ({ subsTitle, rawSubs }) => subsTitle && rawSubs.length > 0,
  fn: ({ subsTitle }) => subsTitle,
  target: esSubsChanged,
});

$rawSubs.on(
  [fetchSubsFx.doneData, subsResyncFx.doneData, updateCustomSubsFx.doneData, rawSubsAdded],
  (_, subs) => subs
);

$rawSubs.on(rawSubsAdded, (oldSubs, newSubs) => {
  const lastSub = oldSubs[oldSubs.length - 1];
  if (!lastSub) {
    return [...oldSubs, ...newSubs];
  }
  if (lastSub.text != newSubs[0].text && lastSub.start != newSubs[0].start) {
    const subs = oldSubs.slice(0, -1);
    lastSub.end = lastSub.start;
    return [...subs, ...[lastSub], ...newSubs];
  }
});

$rawSubs.reset(resetSubs);
$currentSubs.on([updateCurrentSubsFx.doneData, autoPauseFx.doneData], (oldSubs, subs) =>
  JSON.stringify(oldSubs) === JSON.stringify(subs) ? oldSubs : subs
);

$subsDelay.on(subsDelayChangeFx.doneData, (_, newSubsDelay) => newSubsDelay);
$subsLanguage.on(subsLanguageDetectFx.doneData, (_, lang) => lang);
$subsTitle.on(esSubsChanged, (_, value) => value);
$subsTitle.on(updateCustomSubsFx.doneData, () => ES_CUSTOM_SUB_LABEL);

debug(
  $rawSubs,
  $subs,
  $subsDelay,
  subsResyncFx,
  autoPauseFx.doneData,
  $currentSubs,
  subsReloadRequested,
  $subsTitle,
  esSubsChanged,
  subsLanguageDetectFx
);