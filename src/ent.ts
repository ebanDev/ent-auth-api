import toutatice from "./toutatice/auth.ts";
import scpobx from "./scpobx/auth.ts";

// deno-lint-ignore ban-types
export const supportedEnt: { [key: string]: Function } = {
    "toutatice": toutatice,
    "scpobx": scpobx
};
