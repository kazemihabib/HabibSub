import {
  createEffect,
  createEvent,
  createStore,
  sample,
  split,
  UnitValue,
} from "effector";
import { debug } from "patronum";

import {
  TPartOfSpeach,
  TPhrasalVerb,
  TSub,
  TTranslateAlternative,
  TWordTranslation,
  TWordTranslationItem,
} from "../types";
import {
  $translateLanguage,
  translateLanguageChanged,
  $translationService,
  $deeplApiKey,
  $chatGPTApiKey,
  $chatGPTModel,
} from "../settings";
import { googleNumberToPartOfSpeach } from "@src/utils/googleNumberToPartOfSpeach";
import { createGate } from "effector-react";
import { findPhrasalVerbs } from "@src/utils/findPhrasalVerbs";
import { $currentSubs, $subsLanguage } from "../subs";
import { tKeyPressed } from "../keyboard";
import toast from "react-hot-toast";

export const $wordTranslations = createStore<TWordTranslation[]>([]);
export const $wordTranslationsPendings = createStore<Record<string, boolean>>(
  {},
);
export const WordTranslationsGate = createGate<string>("WordTranslationsGate");
export const $currentWordTranslation = createStore<TWordTranslation>(null);
export const requestWordTranslation = createEvent<string>();

export const $currentPhrasalVerbs = createStore<TPhrasalVerb[]>([]);
export const $currentPhrasalVerb = createStore<TPhrasalVerb>(null);
export const $findPhrasalVerbsPendings = createStore<Record<string, boolean>>(
  {},
);
export const $findCurrentPhrasalVerbPendings = createStore<
  Record<string, boolean>
>({});
export const SubItemGate = createGate<{ text: string }>("SubItemGate");
export const findPhrasalVerbsFx = createEffect<
  { subs: TSub[] },
  TPhrasalVerb[]
>(({ subs }) => subs.flatMap((sub) => findPhrasalVerbs(sub.cleanedText)));
export const subItemMouseEntered = createEvent<string>();
export const subItemMouseLeft = createEvent();
export const findCurrentPhrasalVerbFx = createEffect<
  { phrasalVerbs: TPhrasalVerb[]; text: string },
  TPhrasalVerb | null
>(({ phrasalVerbs, text }) =>
  phrasalVerbs.find((phrasalVerb) => phrasalVerb.text.includes(text)),
);

export const $currentSubTranslation = createStore<string>(null);
export const $subTranslationPendings = createStore<Record<string, boolean>>({});
export const SubTranslationGate = createGate<string>("SubTranslationGate");
export const requestSubTranslation = createEvent<string>();
export const translateCurrentSubtitleKeyPressed = createEvent();
export const cleanSubTranslation = createEvent();

sample({
  clock: [translateCurrentSubtitleKeyPressed, tKeyPressed],
  source: $currentSubs,
  filter: (subs) => subs.length > 0,
  fn: (subs) => subs[0].cleanedText,
  target: requestSubTranslation,
});

export const fetchSubTranslationFx = createEffect<
  {
    source: string;
    language: string;
    translationService: string;
    deeplApiKey: string;
    chatGPTApiKey: string;
    chatGPTModel: string;
  },
  string
>(async ({ source, language, translationService, deeplApiKey, chatGPTApiKey, chatGPTModel }) => {
  try {
    console.debug("EasySubs: Sending translation request", { source, language, translationService });
    const resp = await chrome.runtime.sendMessage({
      type: "translateFullText",
      language: language,
      text: source,
      translationService: translationService,
      deeplApiKey: deeplApiKey,
      chatGPTApiKey: chatGPTApiKey,
      chatGPTModel: chatGPTModel,
    });

    if (resp.error) {
      throw new Error(resp.error);
    }

    if (
      translationService === "deepl" ||
      translationService === "bing" ||
      translationService === "yandex" ||
      translationService === "chatgpt"
    ) {
      return resp;
    } else {
      const responseText: string = JSON.parse(resp)
        ["sentences"].map((sentence) => sentence["trans"])
        .join(" ");
      return responseText;
    }
  } catch (error) {
    console.error("EasySubs: Translation error", error);
    throw error;
  }
});

sample({
  clock: fetchSubTranslationFx.failData,
  fn: (error) => error.message || "Translation failed",
  target: createEffect<string, void>((message) => {
    toast.error(message);
  }),
});

export const fetchWordTranslationFx = createEffect<
  { source: string; language: string; translation: TWordTranslation | null },
  TWordTranslation
>(async ({ source, language }) => {
  try {
    const result: any = await chrome.runtime.sendMessage({
      type: "translateWordFull",
      language: language,
      text: source,
    });

    const transcription: string = result[0]?.[0] || "";
    const mainTranslation: string = result[1]?.[0]?.[0]?.[5]?.[0]?.[0] || 
                                    result[1]?.[0]?.[0]?.[5]?.map((s: any) => s[0]).join(" ") || 
                                    "";
    const alternativesRaw =
      (result[3] && result[3][5] && result[3][5][0]) || [];
    const alternatives: [] = alternativesRaw
      .flatMap((alternative: TTranslateAlternative): TWordTranslationItem[] => {
        const variants: [string, string[], number][] = alternative[1].map(
          (val) => [val[0], val[2], val[3]],
        );
        return variants.map((variant) => ({
          word: variant[0],
          partOfSpeech: googleNumberToPartOfSpeach(
            alternative[4],
          ) as TPartOfSpeach,
          synonyms: variant[1].slice(0, 3),
          popularity: variant[2],
        }));
      })
      .sort(
        (a: TWordTranslationItem, b: TWordTranslationItem) =>
          a.popularity - b.popularity,
      )
      .slice(0, 5);

    return {
      source: source,
      mainTranslation: mainTranslation,
      targetLanguage: language,
      translations: alternatives.slice(0, 5),
      transcription: transcription,
    };
  } catch (error) {
    console.error(error);
  }
});

export const updateCurrentWordTranslationFx = createEffect<
  { source: string; language: string; translation: TWordTranslation | null },
  TWordTranslation
>(({ translation }) => translation);

const wordTranslationDataCombined = sample({
  clock: requestWordTranslation,
  source: { wordTranslations: $wordTranslations, language: $translateLanguage },
  fn: ({ wordTranslations, language }, source) => {
    const sourceLowerCase = source.toLowerCase();
    return {
      translation:
        wordTranslations.find((t) => t?.source === sourceLowerCase) ?? null,
      source: sourceLowerCase,
      language: language,
    };
  },
});

split({
  source: wordTranslationDataCombined,
  match: {
    hasTranslation: ({ translation }) => translation !== null,
    noTranslation: ({ translation }) => translation === null,
  },
  cases: {
    hasTranslation: updateCurrentWordTranslationFx,
    noTranslation: fetchWordTranslationFx,
  },
});

$currentWordTranslation.on(
  [fetchWordTranslationFx.doneData, updateCurrentWordTranslationFx.doneData],
  (_, translation) => translation,
);
$currentWordTranslation.reset(WordTranslationsGate.close);
$wordTranslations.on(
  fetchWordTranslationFx.doneData,
  (allTranslation, translation) => [...allTranslation, translation],
);

$wordTranslationsPendings.on(
  fetchWordTranslationFx,
  (pendings, { source }) => ({
    ...pendings,
    [source]: true,
  }),
);

$wordTranslationsPendings.on(
  fetchWordTranslationFx.finally,
  (pendings, { params: { source } }) => {
    const copy = { ...pendings };
    delete copy[source];
    return copy;
  },
);

sample({
  clock: WordTranslationsGate.open,
  target: requestWordTranslation,
});

sample({
  clock: requestSubTranslation,
  source: {
    language: $translateLanguage,
    translationService: $translationService,
    deeplApiKey: $deeplApiKey,
    chatGPTApiKey: $chatGPTApiKey,
    chatGPTModel: $chatGPTModel,
  },
  fn: ({ language, translationService, deeplApiKey, chatGPTApiKey, chatGPTModel }, source) => ({
    source,
    language,
    translationService,
    deeplApiKey,
    chatGPTApiKey,
    chatGPTModel,
  }),
  target: fetchSubTranslationFx,
});

$currentSubTranslation.on(
  fetchSubTranslationFx.doneData,
  (_, translation) => translation,
);
$currentSubTranslation.reset([SubTranslationGate.close, cleanSubTranslation]);
$subTranslationPendings.on(fetchSubTranslationFx, (pendings, { source }) => ({
  ...pendings,
  [source]: true,
}));
$subTranslationPendings.on(
  fetchSubTranslationFx.finally,
  (pendings, { params: { source } }) => {
    const copy = { ...pendings };
    delete copy[source];
    return copy;
  },
);
sample({
  clock: SubTranslationGate.open,
  target: requestSubTranslation,
});

$currentPhrasalVerbs.on(
  findPhrasalVerbsFx.doneData,
  (_, phrasalVerbs) => phrasalVerbs,
);
$findPhrasalVerbsPendings.on(findPhrasalVerbsFx, (pendings, { subs }) => ({
  ...pendings,
  [subs[0].cleanedText]: true,
}));
$findPhrasalVerbsPendings.on(
  findPhrasalVerbsFx.finally,
  (pendings, { params: { subs } }) => {
    const copy = { ...pendings };
    delete copy[subs[0].cleanedText];
    return copy;
  },
);
sample({
  clock: $currentSubs,
  source: {
    translateLanguage: $translateLanguage,
    subsLanguage: $subsLanguage,
  },
  filter: ({ translateLanguage, subsLanguage }, subs) =>
    translateLanguage === "ru" && subsLanguage === "en" && subs.length > 0,
  fn: (_, subs) => ({ subs }),
  target: findPhrasalVerbsFx,
});

$findCurrentPhrasalVerbPendings.on(
  findCurrentPhrasalVerbFx,
  (pendings, { text }) => ({
    ...pendings,
    [text]: true,
  }),
);
$findCurrentPhrasalVerbPendings.on(
  findCurrentPhrasalVerbFx.finally,
  (pendings, { params: { text } }) => {
    const copy = { ...pendings };
    delete copy[text];
    return copy;
  },
);
$currentPhrasalVerb.on(
  findCurrentPhrasalVerbFx.doneData,
  (_, phrasalVerb) => phrasalVerb,
);
$currentPhrasalVerb.reset(subItemMouseLeft);
sample({
  clock: subItemMouseEntered,
  source: { phrasalVerbs: $currentPhrasalVerbs },
  fn: ({ phrasalVerbs }, text) => ({ phrasalVerbs, text }),
  target: findCurrentPhrasalVerbFx,
});

$wordTranslations.reset($translateLanguage);

sample({
  clock: $translateLanguage,
  source: $currentWordTranslation,
  fn: (translation) => (translation ? translation.source : ""),
  target: requestWordTranslation,
});

debug(
  $wordTranslations,
  $currentWordTranslation,
  requestWordTranslation,
  fetchWordTranslationFx.doneData,
  $currentSubTranslation,
  requestSubTranslation,
  cleanSubTranslation,
  fetchSubTranslationFx.doneData,
  findCurrentPhrasalVerbFx,
  $currentPhrasalVerb,
  $currentPhrasalVerbs,
);
