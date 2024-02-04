import { fetch, CookieJar, JSDOM } from "../../../deps.ts";

export async function europresse(cookieJar: CookieJar, portalData: string) {
    const safranUrl = "https://www.toutatice.fr" + new JSDOM(portalData).window.document.querySelector(".safran-placeholder")?.getAttribute("data-url")!;
    const safranData = await fetch(cookieJar, safranUrl, { redirect: "follow" });
    const safranText = await safranData.text();

    const europresseUrlString = new JSDOM(safranText).window.document.querySelector("li[data-id='4794b38c-939e-46fc-a01a-913fc15d5a21'] div")?.getAttribute("urls")!;
    const europresseUrl = JSON.parse(europresseUrlString)["ALL"];

    if (!europresseUrl) {
        throw new Error("Unable to find Europresse URL in portalData");
    }

    const europresseReq = await fetch(cookieJar, europresseUrl, { redirect: "follow" });
    const europresseDom = new JSDOM(await europresseReq.text());

    const europresseSAML = europresseDom.window.document.querySelector("input[name='SAMLResponse']")?.getAttribute("value")!;
    const europresseRelayState = europresseDom.window.document.querySelector("input[name='RelayState']")?.getAttribute("value")!;
    const europresseNextUrl = europresseDom.window.document.querySelector("form")?.getAttribute("action")!;

    const SAMLPayload = { "SAMLResponse": europresseSAML, "RelayState": europresseRelayState };

    await fetch(cookieJar, europresseNextUrl, {
        method: "POST",
        redirect: "follow",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(SAMLPayload)
    });

    return cookieJar;
}