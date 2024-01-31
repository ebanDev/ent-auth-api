#!/usr/bin/env DENO_DIR=/tmp deno run
import {supportedEnt} from "../src/ent.ts";


export default async (req: Request) => {
    const requestParams = new URLSearchParams(req.url.split("?")[1] || "");
    const { ent, username, password, service = "desktop" } = Object.fromEntries(requestParams.entries());

    const jsonResponse = (data: object, status = 200) => new Response(JSON.stringify(data), {
        headers: { "content-type": "application/json;charset=UTF-8" },
        status,
    });

    const errorResponse = (error: string, message: string, status = 400) => jsonResponse({ error, message }, status);

    if (!ent) {
        return errorResponse("missing_ent", "You must provide an ENT.");
    }

    if (!supportedEnt[ent]) {
        return errorResponse("unsupported_ent", `The ENT ${ent} is not supported. Currently, the supported one(s) is/are: ${supportedEnt.join(", ")}`);
    }

    if (!username || !password) {
        return errorResponse("missing_username_or_password", "You must provide a username and a password.");
    }

    return jsonResponse({ cookies: await supportedEnt[ent](username, password, service) });
};
