import { createEvent } from "effector";
import { TMoveDirection } from "../types";

export const moveKeyPressed = createEvent<{ direction: TMoveDirection; force: boolean }>();
export const tKeyPressed = createEvent();
export const uKeyPressed = createEvent();
