import toutatice from "./toutatice/auth.ts";

// deno-lint-ignore ban-types
export const supportedEnt: { [key: string]: Function } = {
    "toutatice": toutatice
};
