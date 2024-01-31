import { fetch, CookieJar } from "npm:node-fetch-cookies";
import { DOMParser, Document } from "https://deno.land/x/deno_dom@v0.1.43/deno-dom-wasm.ts";
import { services } from "./services.ts";

const fetchWithCookieJar = async (cookieJar: CookieJar, url: string, options: RequestInit = {}) => {
    return await fetch(cookieJar, url, { redirect: "follow", ...options });
};

const extractInputValue = (dom: Document, selector: string) => {
    const input = dom.querySelector(selector);
    return input?.getAttribute("value") || "";
};

const buildURLSearchParams = (data: { [key: string]: string }) => {
    return new URLSearchParams(data);
};

const authenticate = async (cookieJar: CookieJar, url: string, payload: { [key: string]: string }) => {
    return await fetchWithCookieJar(cookieJar, url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: buildURLSearchParams(payload),
    });
};

export default async function toutatice(username: string, password: string, service: string) {
    const cookieJar = new CookieJar();
    const toutaticeEntrypoint = "https://www.toutatice.fr/portail/auth/MonEspace";
    const toutaticeLogin = "https://www.toutatice.fr/wayf/Ctrl";
    const toutaticeAuth = "https://www.toutatice.fr/idp/Authn/RemoteUser";

    const fetchAndParse = async (url: string) => {
        const response = await fetchWithCookieJar(cookieJar, url);
        const text = await response.text();
        return new DOMParser().parseFromString(text, "text/html")!;
    };

    const toutaticeEntrypointDom = await fetchAndParse(toutaticeEntrypoint);

    const data = {
        "entityID": extractInputValue(toutaticeEntrypointDom, `.eduouprofils input[name='entityID']`),
        "return": extractInputValue(toutaticeEntrypointDom, `.eduouprofils input[name='return']`),
        "_saml_idp": extractInputValue(toutaticeEntrypointDom, `.eduouprofils input[name='_saml_idp']`),
    };

    const toutaticeLoginReq = await authenticate(cookieJar, toutaticeLogin, data);

    const authPayload = {
        "j_username": username,
        "j_password": password,
        "_eventId_proceed": "",
    };

    const educonnectLoginReq = await authenticate(cookieJar, toutaticeLoginReq.url, authPayload);

    const educonnectSAML = extractInputValue(educonnectLoginReq, "input[name='SAMLResponse']");
    const educonnectRelayState = extractInputValue(educonnectLoginReq, "input[name='RelayState']");
    const educonnectNextUrl = educonnectLoginReq.querySelector("form")?.getAttribute("action")!;

    const SAMLPayload = { "SAMLResponse": educonnectSAML, "RelayState": educonnectRelayState };
    const educonnectAuthReq = await authenticate(cookieJar, educonnectNextUrl, SAMLPayload);

    const toutaticeAuthParams = {
        conversation: educonnectAuthReq.url.split("conversation=")[1].split("&")[0],
        redirectToLoaderRemoteUser: "0",
        sessionid: cookieJar["cookies"].get("www.toutatice.fr").get("IDP_JSESSIONID").value,
    };

    const toutaticeAuthReq = await fetchWithCookieJar(
        cookieJar,
        toutaticeAuth + "?" + buildURLSearchParams(toutaticeAuthParams),
        { method: "GET", redirect: "follow", referrer: educonnectAuthReq.url }
    );

    const toutaticeAuthText = await toutaticeAuthReq.text();
    const toutaticeAuthDom = new DOMParser().parseFromString(toutaticeAuthText, "text/html")!;

    if (!toutaticeAuthDom.title.includes("Mon bureau")) {
        throw new Error("Invalid credentials");
    }

    if (service in services) {
        await services[service](cookieJar, toutaticeAuthText);
    }

    const plainObject: { [key: string]: { [key: string]: string } } = {};
    // deno-lint-ignore no-explicit-any
    cookieJar["cookies"].forEach((value: any, key: any) => {
        plainObject[key] = {};
        // deno-lint-ignore no-explicit-any
        value.forEach((nestedValue: any, nestedKey: any) => {
            plainObject[key][nestedKey] = nestedValue;
        });
    });

    return JSON.stringify(plainObject);
}

export { toutatice };
