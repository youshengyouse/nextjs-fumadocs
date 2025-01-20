// @ts-check
import { $ } from "execa";
import { rimraf } from "rimraf";

console.log(
  "cloning latest docs content from Next.js git repo to _docs_/docs..."
);
await rimraf("_docs_");
await $`mkdir _docs_`;

const $$ = $({
  cwd: "_docs_",
  stdout: ["pipe", "inherit"],
});

await $$`git clone --no-checkout --depth=1 --filter=tree:0 https://github.com/vercel/next.js .`;
await $$`git sparse-checkout set --no-cone /docs`;
await $$`git checkout`;

await rimraf("_docs_/.git");
