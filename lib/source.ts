import type { Source, VirtualFile } from "fumadocs-core/source";
import { loader } from "fumadocs-core/source";
import * as path from "node:path";
import { compileMDX } from "@fumadocs/mdx-remote";
import type { FC } from "react";
import type { TableOfContents } from "fumadocs-core/server";
import { meta } from "./meta";
import { remarkCompact } from "./remark-compact";
import { fetchBlob, getDocsSha, octokit, sharedConfig } from "./github";
import type { MDXComponents } from "mdx/types";

interface CompiledPage {
  full?: boolean;
  source?: string;

  title?: string;
  description?: string;

  toc: TableOfContents;
  body: FC<{ components?: MDXComponents }>;
}

const token = process.env.GITHUB_TOKEN;
if (!token) throw new Error(`environment variable GITHUB_TOKEN is needed.`);

const FileNameRegex = /^\d\d-(.+)$/;

export const source = loader({
  baseUrl: "/docs",
  source: await createGitHubSource(),
  slugs(info) {
    const segments = info.flattenedPath
      .split("/")
      .filter((seg) => !(seg.startsWith("(") && seg.endsWith(")")))
      .map((seg) => {
        const res = FileNameRegex.exec(seg);

        return res ? res[1] : seg;
      });

    if (segments.at(-1) === "index") {
      segments.pop();
    }

    return segments;
  },
});

export async function createGitHubSource(): Promise<
  Source<{
    metaData: { title: string; pages: string[] }; // Your custom type
    pageData: {
      title: string;
      load: () => Promise<CompiledPage>;
    }; // Your custom type
  }>
> {
  const sha = await getDocsSha();
  if (!sha) throw new Error("Failed to find sha of docs directory");

  const out = await octokit.request(
    "GET /repos/{owner}/{repo}/git/trees/{tree_sha}",
    {
      ...sharedConfig,
      tree_sha: sha,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
      recursive: "true",
    },
  );

  const pages = out.data.tree.flatMap((file) => {
    if (!file.path || !file.url || file.type === "tree") return [];

    if (path.extname(file.path) === ".json") {
      console.warn(
        "We do not handle .json files at the moment, you need to hardcode them",
      );
      return [];
    }

    return {
      type: "page",
      path: file.path,
      data: {
        title: getTitleFromFile(file.path),

        async load() {
          const content = await fetchBlob(file.url as string);

          return compile(file.path!, content);
        },
      },
    } satisfies VirtualFile;
  });

  return {
    files: [...pages, ...meta],
  };
}

const cache = new Map<string, Promise<CompiledPage>>();
async function compile(filePath: string, source: string) {
  const key = `${filePath}:${source}`;
  const cached = cache.get(key);

  if (cached) return cached;
  console.time("compile md");
  const compiling = compileMDX({
    filePath,
    source,
    mdxOptions: {
      remarkPlugins: (v) => [remarkCompact, ...v],
      rehypeCodeOptions: {
        langs: [
          "bash",
          "tsx",
          "ts",
          "js",
          "jsx",
          "md",
          "bash",
          "mdx",
          "json",
          "yaml",
          "json5",
          "css",
          "sass",
        ],
        experimentalJSEngine: true,
        themes: {
          light: "github-light",
          dark: "github-dark",
        },
      },
    },
  })
    .then((compiled) => ({
      body: compiled.body,
      toc: compiled.toc,
      ...compiled.frontmatter,
    }))
    .finally(() => {
      console.timeEnd("compile md");
    });

  cache.set(key, compiling);

  return compiling;
}

function getTitleFromFile(file: string) {
  const acronyms = ["css", "ui"];
  const connectives = ["and"];
  const parsed = path.parse(file);
  const name =
    parsed.name === "index" ? path.basename(parsed.dir) : parsed.name;

  const match = FileNameRegex.exec(name);
  const title = match ? match[1] : name;

  const segs = title.split("-");
  for (let i = 0; i < segs.length; i++) {
    if (acronyms.includes(segs[i])) {
      segs[i] = segs[i].toUpperCase();
    } else if (!connectives.includes(segs[i])) {
      segs[i] = segs[i].slice(0, 1).toUpperCase() + segs[i].slice(1);
    }
  }

  const out = segs.join(" ");
  return out.length > 0 ? out : "Overview";
}
