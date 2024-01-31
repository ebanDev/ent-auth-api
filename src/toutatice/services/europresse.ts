import { fetch, CookieJar } from "npm:node-fetch-cookies";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.43/deno-dom-wasm.ts";

export async function europresse(cookieJar: CookieJar, portalData: string) {
    const safranUrl = "https://www.toutatice.fr" + new DOMParser().parseFromString(portalData, "text/html")!.querySelector(".safran-placeholder")?.getAttribute("data-url")!;
    const safranData = await fetch(cookieJar, safranUrl, { redirect: "follow" });
    const safranText = await safranData.text();

    const europresseUrlString = new DOMParser().parseFromString(safranText, "text/html")!.querySelector("li[data-id='4794b38c-939e-46fc-a01a-913fc15d5a21'] div")?.getAttribute("urls")!;
    const europresseUrl = JSON.parse(europresseUrlString)["ALL"];

    if (!europresseUrl) {
        throw new Error("Unable to find Europresse URL in portalData");
    }

    const europresseReq = await fetch(cookieJar, europresseUrl, { redirect: "follow" });
    const europresseDom = new DOMParser().parseFromString(await europresseReq.text(), "text/html")!;

    const europresseSAML = europresseDom.querySelector("input[name='SAMLResponse']")?.getAttribute("value")!;
    const europresseRelayState = europresseDom.querySelector("input[name='RelayState']")?.getAttribute("value")!;
    const europresseNextUrl = europresseDom.querySelector("form")?.getAttribute("action")!;

    const SAMLPayload = { "SAMLResponse": europresseSAML, "RelayState": europresseRelayState };

    await fetch(cookieJar, europresseNextUrl, {
        method: "POST",
        redirect: "follow",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(SAMLPayload)
    });

    return cookieJar;
}
