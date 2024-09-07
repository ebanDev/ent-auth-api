import { build, emptyDir } from "https://deno.land/x/dnt@0.37.0/mod.ts";

await emptyDir("./npm");

await build({
    entryPoints: ["./mod.ts"],
    outDir: "./npm",
    scriptModule: false,
    typeCheck: false,
    shims: {
        deno: true,
    },
    package: {
        name: "ent-cookies",
        version: "1.1.0",
        description:
            "Get your ENT cookies from your username and password for any service!",
        license: "MIT",
        repository: {
            type: "git",
            url: "git+https://github.com/ebanDev/ent-cookies.git",
        },
        bugs: {
            url: "https://github.com/ebanDev/ent-cookies/issues",
        },
    },
    postBuild() {
        Deno.copyFileSync("LICENSE", "npm/LICENSE");
        Deno.copyFileSync("README.md", "npm/README.md");
    },
});
