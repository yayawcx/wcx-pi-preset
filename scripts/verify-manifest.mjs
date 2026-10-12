// Pi 加载资源时只认 manifest 里写的路径，路径错了不会报错、只是静默少加载。
// 发布前把每条路径过一遍，避免发出一个"装了但什么都没生效"的 preset。
import { existsSync } from "node:fs";
import { readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const manifest = pkg.pi ?? {};

let missing = 0;
for (const [kind, entries] of Object.entries(manifest)) {
  for (const entry of entries) {
    if (!existsSync(new URL(`../${entry}`, import.meta.url))) {
      console.error(`missing ${kind}: ${entry}`);
      missing++;
    }
  }
}

const declared = new Set(Object.keys(pkg.dependencies ?? {}));
const bundled = new Set(pkg.bundleDependencies ?? pkg.bundledDependencies ?? []);
for (const dep of declared) {
  if (!bundled.has(dep)) console.error(`dependency not bundled: ${dep}`);
}
for (const dep of bundled) {
  if (!declared.has(dep)) console.error(`bundled dep not in dependencies: ${dep}`);
}

if (missing > 0) process.exit(1);
console.log(`manifest ok: ${Object.values(manifest).flat().length} resource paths, ${bundled.size} bundled deps`);
