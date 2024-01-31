import {supportedEnt} from "./src/ent.ts";

export async function getCookies(ent: string, username: string, password: string, service: string) {
    if (!ent) {
        throw new Error("You must provide an ENT.");
    }

    if (!supportedEnt[ent]) {
        throw new Error(`The ENT ${ent} is not supported. Currently, the supported one(s) is/are: ${Object.keys(supportedEnt).join(", ")}`);
    }

    if (!username || !password) {
        throw new Error("You must provide a username and a password.");
    }

    if (!service) {
        throw new Error("You must provide a service.");
    }

    return await supportedEnt[ent](username, password, service);
}