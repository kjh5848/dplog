import Link from "next/link";
import { designPages, designVariants } from "@/features/design/designData";

export default function Page() {
  return (
    <div className="gemini-root dplog-shell theme-v1 min-h-screen">
      <main className="mx-auto w-full max-w-5xl px-6 py-12">
        <header className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.4em] text-accent-soft">디자인 프리뷰</p>
          <h1 className="text-3xl font-bold">v1 · v2 · v3 테마 비교</h1>
          <p className="text-sm text-white/60">
            각 페이지를 v1/v2/v3 테마로 확인할 수 있습니다. 내부 페이지는 라이트 버전으로 표시됩니다.
          </p>
        </header>

        <section className="mt-10 space-y-4">
          {designPages.map((page) => (
            <div
              key={page.slug}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-semibold">{page.label}</p>
                  <p className="text-xs text-white/50">{page.route}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {designVariants.map((variant) => (
                    <Link
                      key={variant}
                      className="btn btn-outline btn-sm"
                      href={`/design/${variant}/${page.slug}`}
                    >
                      {variant.toUpperCase()}
                    </Link>
                  ))}
                  <Link
                    className="btn btn-ghost btn-sm"
                    href={page.route}
                  >
                    실제 페이지
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
