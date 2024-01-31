import { fetch, CookieJar } from "../../../deps.ts";

export async function pronote(cookieJar: CookieJar, portalData: string) {
    const etabIdRegex = /"UAI"\s*:\s*"(\d+S)"/;
    const etabId = portalData.match(etabIdRegex);

    if (!etabId) {
        throw new Error("Unable to find UAI in portalData");
    }

    const pronoteUrl = `https://${etabId[1]}.index-education.net/pronote/`;

    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    };

    await fetch(cookieJar, pronoteUrl, { redirect: "follow", headers });

    return cookieJar;
}
