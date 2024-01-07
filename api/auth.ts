import { toutatice } from "../src/toutatice/auth.ts";


export default async (req: Request) => {
    const requestParams = new URLSearchParams(req.url.split("?")[1] || null);
    const supportedEnt = ["toutatice"]

    if (requestParams.get("ent") == null) {
        return new Response(
            JSON.stringify({
                error: "missing_ent",
                message: "You must provide an ENT.",
            }),
            {
                headers: {
                    "content-type": "application/json;charset=UTF-8",
                },
            },
        );
    }
    else if (requestParams.get("ent").includes("toutatice") == false) {
        return new Response(
            JSON.stringify({
                error: "unsupported_ent",
                message: `The ENT ${requestParams.get("ent")} is not supported. Currently, the supported one(s) is/are: ${supportedEnt.join(", ")}`,
            }),
            {
                headers: {
                    "content-type": "application/json;charset=UTF-8",
                },
            },
        );
    }
    else if (requestParams.get("username") == null || requestParams.get("password") == null) {
        return new Response(
            JSON.stringify({
                error: "missing_username_or_password",
                message: "You must provide a username and a password.",
            }),
            {
                headers: {
                    "content-type": "application/json;charset=UTF-8",
                },
            },
        )
    } else {
        return new Response(
            await toutatice(requestParams.get("username"), requestParams.get("password")),
            {
                headers: {
                    "content-type": "application/json;charset=UTF-8",
                },
            },
        );
    }
};