// Auto-discovers every competition data file in this directory, so adding a
// new competition is just dropping in another <slug>.mjs — nothing to
// register here.
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const dir = fileURLToPath(new URL("./", import.meta.url));

const files = readdirSync(dir)
  .filter((f) => f.endsWith(".mjs") && f !== "index.mjs" && !f.startsWith("_"))
  .sort();

const loaded = [];
for (const file of files) {
  const mod = await import(new URL(file, import.meta.url));
  if (mod.default?.slug) loaded.push(mod.default);
}

export const COMPETITIONS = loaded;
