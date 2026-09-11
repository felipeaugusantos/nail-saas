import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import AppSidebar from "@/components/app-sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const account = await prisma.account.findUnique({
    where: { id: session.user.accountId },
    select: { name: true, slug: true },
  });

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <AppSidebar
        accountName={account?.name ?? "Minha conta"}
        accountSlug={account?.slug ?? ""}
        userName={session.user.name ?? "Usuário"}
      />
      <div className="flex-1 overflow-x-hidden">
        <main className="mx-auto max-w-6xl px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
