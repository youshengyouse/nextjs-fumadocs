import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col justify-center text-center">
      <h1 className="mb-4 text-xl font-semibold">Next.js 文档</h1>
      <p className="text-fd-muted-foreground mb-4">
      使用 Fumadocs 预览 Next.js 文档
      </p>
      <div className="flex flex-row items-center justify-center">
        <Link
          href="/docs"
          className="rounded-full text-fd-primary-foreground font-medium text-sm bg-fd-primary px-6 py-2.5 transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
        >
          打开文档
        </Link>
      </div>
    </main>
  );
}
