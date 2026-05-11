import { Bot, Instagram, MessageCircle, Users } from "lucide-react";
import { auth } from "@/auth";
import { getSocialBotThreads } from "@/lib/social-bot-db";

export const dynamic = "force-dynamic";

const sourceIcon: Record<string, typeof MessageCircle> = {
  WHATSAPP: MessageCircle,
  INSTAGRAM: Instagram,
  MESSENGER: Bot
};

const sourceColor: Record<string, string> = {
  WHATSAPP: "bg-emerald-500/15 text-emerald-300",
  INSTAGRAM: "bg-pink-500/15 text-pink-300",
  MESSENGER: "bg-sky-500/15 text-sky-300"
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
    mode: t.mode,
    unread: t.unreadCount ?? 0
  }));

  return (
    <div className="min-h-full space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Contacts</h1>
          <p className="mt-0.5 text-sm text-white/40">{contacts.length} contact{contacts.length !== 1 ? "s" : ""} across all channels</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 text-sm text-white/30">
          <Users className="h-4 w-4" />
          All channels
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03]">
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-5 py-4">
          <Users className="h-4 w-4 text-violet-400" />
          <h2 className="text-sm font-semibold text-white">All Contacts</h2>
          <span className="ml-auto rounded-full bg-violet-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-violet-300">{contacts.length}</span>
        </div>

        {contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03]">
              <Users className="h-7 w-7 text-white/10" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/40">No contacts yet</p>
              <p className="mt-1 text-xs text-white/20">Contacts appear when conversations come in</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {contacts.map((c) => {
              const Icon = sourceIcon[c.source] ?? MessageCircle;
              const initials = c.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
              const date = c.lastSeen ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(c.lastSeen)) : "—";
              return (
                <div key={c.id} className="flex items-center gap-4 px-5 py-4 transition hover:bg-white/[0.02]">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/35 to-purple-700/25 text-sm font-bold text-violet-200">
                    {initials || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold text-white/90">{c.name}</p>
                      {c.unread > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-600 px-1.5 text-[10px] font-bold text-white shadow-[0_0_8px_rgba(124,58,237,0.5)]">{c.unread}</span>}
                    </div>
                    <p className="truncate text-xs text-white/30">{c.handle || "—"}</p>
                  </div>
                  <div className="hidden items-center gap-2 sm:flex">
                    <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold ${sourceColor[c.source] ?? "bg-white/10 text-white/40"}`}>
                      <Icon className="h-3 w-3" />
                      {c.source}
                    </div>
                  </div>
                  <div className="hidden text-right xl:block">
                    <p className="text-xs text-white/30">{date}</p>
                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.mode === "AI" ? "bg-emerald-500/20 text-emerald-300" : "bg-white/[0.08] text-white/35"}`}>{c.mode}</span>
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
