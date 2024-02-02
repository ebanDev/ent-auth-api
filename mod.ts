import {supportedEnt} from "./src/ent.ts";
import {CookieJar} from "./deps.ts";

/**
 * Get cookies for a service from an ENT.
 * @param ent - name of the ENT you want to use.
 * @param username - username of your ENT account.
 * @param password - password of your ENT account.
 * @param service - name of the service you want to get cookies from (pronote for example).
 * @returns The cookieJar containing the cookies for the service.
 */
export async function getCookies(ent: string, username: string, password: string, service: string): Promise<CookieJar> {
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