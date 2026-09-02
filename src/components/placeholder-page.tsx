import { AppShell } from "@/components/app-shell";

type PlaceholderPageProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PlaceholderPage({ eyebrow, title, description }: PlaceholderPageProps) {
  return (
    <AppShell eyebrow={eyebrow} title={title} description={description}>
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-teal-50 text-lg font-semibold text-teal-700">{title.slice(0, 1)}</div>
        <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-slate-500">此页面目前为基础占位，功能将在后续阶段开发。</p>
      </section>
    </AppShell>
  );
}
