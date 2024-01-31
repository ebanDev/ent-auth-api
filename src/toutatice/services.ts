import { europresse } from "./services/europresse.ts";
import { pronote } from "./services/pronote.ts";

// deno-lint-ignore ban-types
export const services: { [key: string]: Function } = {
    "europresse": europresse,
    "pronote": pronote
};