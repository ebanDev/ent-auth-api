import { fetch, CookieJar, DOMParser } from "../../../deps.ts";

export async function europresse(cookieJar: CookieJar) {
    const proxyUrl = "http://proxy.sciencespobordeaux.fr/login?url=https://nouveau.europresse.com/access/ip/default.aspx?un=SCIENCESPOT_1"
    const proxyData = await fetch(cookieJar, proxyUrl, { redirect: "follow" });

    const europressProxyDomain = proxyData.url.split("/")[2];

    return { 
        cookieJar: cookieJar,
        domain: europressProxyDomain
     };
};