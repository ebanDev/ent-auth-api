import { fetch, CookieJar, JSDOM } from "../../deps.ts";
import { services } from "./services.ts";

const fetchWithCookieJar = async (cookieJar: CookieJar, url: string, options: RequestInit = {}) => {
    return await fetch(cookieJar, url, { redirect: "follow", ...options });
};

const extractInputValue = (dom: JSDOM, selector: string) => {
    const input = dom.window.document.querySelector(selector);
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
        return new JSDOM(text);
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
    const educonnectLoginDom = new JSDOM(await educonnectLoginReq.text());

    const educonnectSAML = extractInputValue(educonnectLoginDom, "input[name='SAMLResponse']");
    const educonnectRelayState = extractInputValue(educonnectLoginDom, "input[name='RelayState']");
    const educonnectNextUrl = educonnectLoginDom.window.document.querySelector("form")?.getAttribute("action")!;

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
    const toutaticeAuthDom = new JSDOM(toutaticeAuthText);

    const finalCookiesParams = {
        conversation: toutaticeAuthDom.window.document.querySelector("conversation")?.textContent || "None",
        uidInSession: toutaticeAuthDom.window.document.querySelector("uidInSession")?.getAttribute("value")!,
        sessionid: toutaticeAuthDom.window.document.querySelector("input[name='sessionid']")?.getAttribute("value")!,
    }

    const finalCookiesReq = await fetchWithCookieJar(
        cookieJar,
        toutaticeAuth + "?" + buildURLSearchParams(finalCookiesParams),
        { method: "GET", redirect: "follow" }
    );

    const finalCookiesText = await finalCookiesReq.text();
    const finalCookiesDom = new JSDOM(finalCookiesText);

    if (!finalCookiesDom.window.document.title.includes("Mon bureau")) {
        throw new Error("Invalid credentials");
    }

    if (service in services) {
        await services[service](cookieJar, finalCookiesText);
    }

    return cookieJar;
}

export { toutatice };
