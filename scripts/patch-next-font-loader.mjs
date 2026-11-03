/**
 * Next 15.5.28's Google font loader crashes when fonts.gstatic.com answers
 * with an extensionless /l/font?kit= URL:
 *
 *   TypeError: Cannot read properties of null (reading '1')
 *   at next/dist/compiled/@next/font/dist/google/loader.js
 *
 * The stylesheet still says format('woff2') and the bytes are woff2. Upstream
 * fixed this for webpack in vercel/next.js#100158, but that change is not in
 * the 15.5 line (including 15.5.29). Apply the same two-file behavior here
 * until a patched 15.x release includes it. Idempotent.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(join(root, "package.json"));
const nextVersion = require("next/package.json").version;

const finderPath = join(
  root,
  "node_modules/next/dist/compiled/@next/font/dist/google/find-font-files-in-css.js",
);
const loaderPath = join(
  root,
  "node_modules/next/dist/compiled/@next/font/dist/google/loader.js",
);

const finderNeedle = `                // Found the font file in the @font-face declaration.
                fontFiles.push({
                    googleFontFileUrl,
                    preloadFontFile: !!(subsetsToPreload === null || subsetsToPreload === void 0 ? void 0 : subsetsToPreload.includes(currentSubset)),
                });`;

const finderPatch = `                // Google can return extensionless /l/font?kit= URLs.
                // Prefer a pathname extension, then the CSS format() hint.
                // The fetch user agent asks for woff2, so that is the fallback.
                const pathname = googleFontFileUrl.split(/[?#]/, 1)[0];
                const formatMatch = /format\\(['"](.+?)['"]\\)/.exec(line);
                const format = formatMatch ? formatMatch[1] : "";
                const pathExt = /\\.(woff|woff2|eot|ttf|otf)$/.exec(pathname);
                const formatExt = {
                    woff: "woff",
                    woff2: "woff2",
                    truetype: "ttf",
                    opentype: "otf",
                    "embedded-opentype": "eot",
                }[format];
                const ext = (pathExt ? pathExt[1] : undefined) || formatExt || "woff2";
                fontFiles.push({
                    googleFontFileUrl,
                    preloadFontFile: !!(subsetsToPreload === null || subsetsToPreload === void 0 ? void 0 : subsetsToPreload.includes(currentSubset)),
                    ext,
                });`;

const loaderMapNeedle =
  "fontFiles.map(async ({ googleFontFileUrl, preloadFontFile }) => {";
const loaderMapPatch =
  "fontFiles.map(async ({ googleFontFileUrl, preloadFontFile, ext }) => {";
const loaderExtNeedle =
  "            const ext = /\\.(woff|woff2|eot|ttf|otf)$/.exec(googleFontFileUrl)[1];\n";

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

if (!nextVersion.startsWith("15.")) {
  fail(
    `patch-next-font-loader.mjs only understands Next 15.x (found ${nextVersion}).`,
  );
}

let finder = readFileSync(finderPath, "utf8");
let loader = readFileSync(loaderPath, "utf8");

const finderPatched = finder.includes("googleFontFileUrl.split(/[?#]/, 1)");
const loaderPatched =
  loader.includes(loaderMapPatch) && !loader.includes(loaderExtNeedle.trim());

if (finderPatched && loaderPatched) {
  process.exit(0);
}

if (finderPatched !== loaderPatched) {
  fail(
    "next/font loader patch is half-applied. Reinstall next@15.5.28 and rerun this script.",
  );
}

if (!finder.includes(finderNeedle) || !loader.includes(loaderMapNeedle) || !loader.includes(loaderExtNeedle)) {
  fail(
    `next@${nextVersion} font loader does not match the 15.5.28 source this patch expects. ` +
      "Update scripts/patch-next-font-loader.mjs or drop it if the release includes vercel/next.js#100158.",
  );
}

finder = finder.replace(finderNeedle, finderPatch);
loader = loader.replace(loaderMapNeedle, loaderMapPatch).replace(loaderExtNeedle, "");

writeFileSync(finderPath, finder);
writeFileSync(loaderPath, loader);
