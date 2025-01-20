import { $ } from "execa";
import { rimraf } from "rimraf";

await rimraf("_docs_");
await $`mkdir _docs_`;

const $$ = $({ cwd: "_docs_" });

const { stdout } =
  await $$`git clone --no-checkout --depth=1 --filter=tree:0 https://github.com/vercel/next.js .`
    .pipe`git sparse-checkout set --no-cone /docs`.pipe`git checkout`;

console.log(stdout);
