import { $streaming } from "@src/models/streamings";
import { moveKeyPressed, tKeyPressed, uKeyPressed } from "@src/models/keyboard";

const keyboardEvents = ["keyup", "keydown", "keypress"];

export const keyboardHandler = (event: KeyboardEvent) => {
  if (event.code === "ArrowLeft") {
    event.stopPropagation();
    if (event.type === "keydown") {
      const video = document.querySelector("video");
      if (video) video.currentTime -= 5;
    }
  }
  if (event.code === "ArrowRight") {
    event.stopPropagation();
    if (event.type === "keydown") {
      const video = document.querySelector("video");
      if (video) video.currentTime += 5;
    }
  }
  if (event.code === "KeyA" || event.key === "a") {
    event.stopPropagation();
    if (event.type === "keydown") {
      moveKeyPressed({ direction: "prev", force: true });
    }
  }
  if (event.code === "KeyD" || event.key === "d") {
    event.stopPropagation();
    if (event.type === "keydown") {
      moveKeyPressed({ direction: "next", force: true });
    }
  }
  if (event.code === "KeyR" || event.key === "r") {
    event.stopPropagation();
    if (event.type === "keydown") {
      moveKeyPressed({ direction: "current", force: false });
    }
  }
  if (event.code === "ArrowDown") {
    // Keep standard browser behavior for ArrowDown or override if needed
  }
  if (event.code === "KeyT" || event.key === "t") {
    event.stopPropagation();
    if (event.type === "keydown") {
      tKeyPressed();
    }
  }
  if (event.code === "KeyU" || event.key === "u") {
    event.stopPropagation();
    if (event.type === "keydown") {
      uKeyPressed();
    }
  }
};

export const addKeyboardEventsListeners = () => {
  if ($streaming.getState().isOnFlight()) {
    return;
  }
  keyboardEvents.forEach((eventType) => {
    document.addEventListener(eventType as any, keyboardHandler, true);
  });
};

export const removeKeyboardEventsListeners = () => {
  keyboardEvents.forEach((eventType) => {
    document.removeEventListener(eventType as any, keyboardHandler, true);
  });
};
