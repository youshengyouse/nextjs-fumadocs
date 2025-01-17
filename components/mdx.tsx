import { Callout } from "fumadocs-ui/components/callout";
import { Tabs, Tab } from "fumadocs-ui/components/tabs";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { Check, X } from "lucide-react";
import Image from "next/image";
import { Fragment, type ReactNode } from "react";

const isDev = process.env.NODE_ENV === "development";

const mdxComponents = {
  ...defaultMdxComponents,
  blockquote: Callout,
  Tabs,
  Tab,
  Check,
  Cross: X,
  Image: (props: {
    srcDark: string;
    srcLight: string;

    width: string | number;
    height: string | number;
    alt: string;
  }) => (
    <picture>
      <source
        srcSet={isDev ? `https://nextjs.org${props.srcDark}` : props.srcDark}
        media="(prefers-color-scheme: dark)"
      />
      <Image
        src={isDev ? `https://nextjs.org${props.srcLight}` : props.srcLight}
        alt="My image"
        width={props.width as any}
        height={props.height as any}
        className="rounded-lg"
      />
    </picture>
  ),
};

export function createMdxComponents(isAppRouter: boolean) {
  return {
    ...mdxComponents,
    AppOnly: ({ children }: { children: ReactNode }) =>
      isAppRouter ? <Fragment>{children}</Fragment> : null,
    PagesOnly: ({ children }: { children: ReactNode }) =>
      !isAppRouter ? <Fragment>{children}</Fragment> : null,
  };
}
