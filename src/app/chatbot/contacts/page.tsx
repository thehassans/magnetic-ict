import { Bot, Instagram, MessageCircle, Search, Users } from "lucide-react";
import { auth } from "@/auth";
import { getSocialBotThreads } from "@/lib/social-bot-db";

export const dynamic = "force-dynamic";

const sourceIcon: Record<string, typeof MessageCircle> = {
  WHATSAPP: MessageCircle,
  INSTAGRAM: Instagram,
  MESSENGER: Bot
};

export default async function ChatbotContactsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const threads = await getSocialBotThreads(session.user.id);

  const contacts = threads.map((t) => ({
    id: t._id,
    name: t.contactName,
    handle: t.contactHandle,
    source: t.source,
    lastSeen: t.lastMessageAt,
    preview: t.lastMessagePreview,
    mode: t.mode,
    unread: t.unreadCount ?? 0
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">Contacts</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {contacts.length} contact{contacts.length !== 1 ? "s" : ""} across all channels
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-slate-900">
          <Search className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-400">Search contacts…</span>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
        <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4 dark:border-white/10">
          <Users className="h-4 w-4 text-violet-600" />
          <h2 className="font-semibold text-slate-950 dark:text-white">All Contacts</h2>
        </div>

        {contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Users className="h-10 w-10 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">No contacts yet</p>
            <p className="text-xs text-slate-400">Contacts appear here when conversations come in.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-white/10">
            {contacts.map((c) => {
              const Icon = sourceIcon[c.source] ?? MessageCircle;
              const initials = c.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
              const date = c.lastSeen ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(c.lastSeen)) : "—";
              return (
                <div key={c.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-white/[0.03]">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700 dark:bg-violet-400/20 dark:text-violet-300">
                    {initials || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold text-slate-950 dark:text-white">{c.name}</p>
                      {c.unread > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-600 px-1.5 text-[10px] font-bold text-white">{c.unread}</span>
                      )}
                    </div>
                    <p className="truncate text-xs text-slate-400">{c.handle || "—"}</p>
                  </div>
                  <div className="hidden items-center gap-2 sm:flex">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs text-slate-400">{c.source}</span>
                  </div>
                  <div className="hidden text-right xl:block">
                    <p className="text-xs text-slate-400">{date}</p>
                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.mode === "AI" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{c.mode}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
