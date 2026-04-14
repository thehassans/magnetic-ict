import { ArrowLeft, ImageIcon, Sparkles } from "lucide-react";
import { ImageConversionTool } from "@/components/services/image-conversion-tool";
import { Link } from "@/i18n/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ImageConversionLivePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <main className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[40px] border border-violet-100 bg-white/90 p-8 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/70 sm:p-10 lg:p-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.16),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(6,182,212,0.18),transparent_24%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.24),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(6,182,212,0.24),transparent_24%)]" />
        <div className="relative z-10 space-y-6">
          <Link
            href="/services/imageConversion"
            locale={locale}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-violet-200 hover:text-violet-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Image Conversion
          </Link>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-200">
                <ImageIcon className="h-4 w-4" />
                Free image utility
              </div>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
                Convert JPG, PNG, and WebP images and resize them in one live workflow.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
                Upload an image, choose the output format, set custom dimensions, preview the processed result, and download the final file instantly.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[26px] border border-slate-200 bg-white/80 p-5 dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center gap-3 text-slate-950 dark:text-white">
                  <Sparkles className="h-5 w-5 text-cyan-500" />
                  <span className="font-semibold">Popular web formats</span>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">JPG, PNG, and WebP conversions are fully wired and ready to download.</p>
              </div>
              <div className="rounded-[26px] border border-slate-200 bg-white/80 p-5 dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center gap-3 text-slate-950 dark:text-white">
                  <ImageIcon className="h-5 w-5 text-emerald-500" />
                  <span className="font-semibold">Custom resize controls</span>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Set width, height, quality, and resize behavior before export.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ImageConversionTool />
    </main>
  );
}
