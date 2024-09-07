import { europresse } from "./services/europresse.ts";

// deno-lint-ignore ban-types
export const services: { [key: string]: Function } = {
    "europresse": europresse,
};