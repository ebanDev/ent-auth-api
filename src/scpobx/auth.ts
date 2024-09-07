import { fetch, CookieJar, DOMParser, Document } from "../../deps.ts";
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

export default async function scpobx(username: string, password: string, service: string) {
    const cookieJar = new CookieJar();
    const scpobxEntrypoint = "https://cas.sciencespobordeaux.fr/login?service=https%3A%2F%2Fent.sciencespobordeaux.fr%2F_authenticate%3FrequestedURL%3D%252Ffr%252Findex.html&gateway=true";
    const scpobxLogin = "https://cas.sciencespobordeaux.fr/login?service=https%3A%2F%2Fent.sciencespobordeaux.fr%2F_authenticate%3FrequestedURL%3D%252Ffr%252Findex.html";

    const fetchAndParse = async (url: string) => {
        const response = await fetchWithCookieJar(cookieJar, url);
        const text = await response.text();
        return new DOMParser().parseFromString(text, "text/html")!;
    };

    const scpobxEntrypointDom = await fetchAndParse(scpobxEntrypoint);

    const scpoxbxLoginFormData = {
        "execution": extractInputValue(scpobxEntrypointDom, `input[name='execution']`),
        "_eventId": extractInputValue(scpobxEntrypointDom, `input[name='_eventId']`),
        "geolocation": extractInputValue(scpobxEntrypointDom, `input[name='geolocation']`),
        "username": username,
        "password": password,
    };

    const scpobxLoginReq = await authenticate(cookieJar, scpobxLogin, scpoxbxLoginFormData);

    const scpobxLoginText = await scpobxLoginReq.text();
    const scpobxLoginDom = new DOMParser().parseFromString(scpobxLoginText, "text/html")!;

    if (!scpobxLoginDom.title.includes("ENT | Accueil")) {
        throw new Error("Invalid credentials");
    };

    if (service in services) {
        return await services[service](cookieJar);
    }

    return {
        cookieJar: cookieJar,
        domain: "ent.sciencespobordeaux.fr"
    }
};

export { scpobx };