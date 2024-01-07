import {fetch, CookieJar} from "npm:node-fetch-cookies";
import {DOMParser} from "https://deno.land/x/deno_dom@v0.1.43/deno-dom-wasm.ts";

function replacer(key, value) {
    if(value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries()), // or with spread: value: [...value]
        };
    } else {
        return value;
    }
}

async function toutatice(username: string, password: string) {
// Define constants
    const cookieJar = new CookieJar();
    const toutaticeEntrypoint = "https://www.toutatice.fr/portail/auth/MonEspace";
    const toutaticeLogin = "https://www.toutatice.fr/wayf/Ctrl";
    const toutaticeAuth = "https://www.toutatice.fr/idp/Authn/RemoteUser";

// Fetch entry point
    const toutaticeEntrypointReq = await fetch(cookieJar, toutaticeEntrypoint, {redirect: "follow"});
    const toutaticeEntrypointText = await toutaticeEntrypointReq.text();
    const toutaticeEntrypointDom = new DOMParser().parseFromString(toutaticeEntrypointText, "text/html")!;

// Extract data from entry point response
    const data = {
        "entityID": toutaticeEntrypointDom.querySelector(`.eduouprofils input[name='entityID']`)?.getAttribute("value"),
        "return": toutaticeEntrypointDom.querySelector(`.eduouprofils input[name='return']`)?.getAttribute("value"),
        "_saml_idp": toutaticeEntrypointDom.querySelector(`.eduouprofils input[name='_saml_idp']`)?.getAttribute("value"),
    };

// Login to Toutatice
    const toutaticeLoginReq = await fetch(cookieJar, toutaticeLogin, {
        method: "POST",
        redirect: "follow",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams(data)
    });

// Extract src payload
    const authPayload = {
        "j_username": username,
        "j_password": password,
        "_eventId_proceed": ""
    }

// Login to Educonnect
    const educonnectLoginReq = await fetch(cookieJar, toutaticeLoginReq.url, {
        method: "POST",
        redirect: "follow",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams(authPayload)
    });

// Extract SAML information
    const educonnectLoginText = await educonnectLoginReq.text();
    const educonnectAuthDom = new DOMParser().parseFromString(educonnectLoginText, "text/html")!;
    const educonnectSAML = educonnectAuthDom.querySelector("input[name='SAMLResponse']")?.getAttribute("value")!;
    const educonnectRelayState = educonnectAuthDom.querySelector("input[name='RelayState']")?.getAttribute("value")!;
    const educonnectNextUrl = educonnectAuthDom.querySelector("form")?.getAttribute("action")!;

// Build SAML payload
    const SAMLPayload = {
        "SAMLResponse": educonnectSAML,
        "RelayState": educonnectRelayState
    }

// Authenticate with Educonnect
    const educonnectAuthReq = await fetch(cookieJar, educonnectNextUrl, {
        method: "POST",
        redirect: "follow",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams(SAMLPayload)
    });


// Extract Toutatice src parameters
    const toutaticeAuthParams = {
        conversation: educonnectAuthReq.url.split("conversation=")[1].split("&")[0],
        redirectToLoaderRemoteUser: 0,
        sessionid: cookieJar.cookies.get("www.toutatice.fr").get("IDP_JSESSIONID").value,
    }

// Authenticate with Toutatice
    const toutaticeAuthReq = await fetch(cookieJar, toutaticeAuth + "?" + new URLSearchParams(toutaticeAuthParams), {
        method: "GET",
        redirect: "follow",
        referrer: educonnectAuthReq.url
    });

// Extract final cookies information
    const toutaticeAuthText = await toutaticeAuthReq.text();
    const toutaticeAuthDom = new DOMParser().parseFromString(toutaticeAuthText, "text/html")!;

    const finalCookiesParams = {
        conversation: toutaticeAuthDom.querySelector("conversation")?.innerHTML,
        uidInSession: toutaticeAuthDom.querySelector("uidInSession")?.getAttribute("value")!,
        sessionid: toutaticeAuthDom.querySelector("input[name='sessionid']")?.getAttribute("value")!,
    }

// Final request for cookies
    const finalCookiesReq = await fetch(cookieJar, toutaticeAuth + "?" + new URLSearchParams(finalCookiesParams), {
        method: "GET",
        redirect: "follow",
    });

    const finalCookiesText = await finalCookiesReq.text();
    const finalCookiesDom = new DOMParser().parseFromString(finalCookiesText, "text/html")!;

    if (finalCookiesDom.title.includes("Mon bureau")) {
        console.log("Authentification success");
    } else {
        throw new Error("Invalid credentials");
    }

    return JSON.stringify(cookieJar.cookies, replacer);
}



export { toutatice }