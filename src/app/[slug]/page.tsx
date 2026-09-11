import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCentsToBRL } from "@/lib/utils";
import BookingForm from "./booking-form";

export default async function PublicBookingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const account = await prisma.account.findUnique({
    where: { slug },
    include: {
      services: { where: { active: true }, orderBy: { name: "asc" } },
    },
  });

  if (!account) notFound();

  const initials = account.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="h-36 bg-gradient-to-br from-zinc-900 via-zinc-900 to-rose-900" />

      <div className="mx-auto -mt-14 max-w-3xl px-4 pb-16">
        <div className="flex items-end gap-4">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-4 border-zinc-50 bg-rose-600 text-2xl font-bold text-white shadow-sm">
            {initials}
          </div>
          <div className="pb-1">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              {account.name}
            </h1>
            <p className="text-sm text-zinc-500">
              Agende seu horário online, sem complicação.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <BookingForm
            slug={slug}
            services={account.services.map((s) => ({
              id: s.id,
              name: s.name,
              durationMin: s.durationMin,
              priceLabel: formatCentsToBRL(s.priceCents),
            }))}
          />
        </div>
      </div>
    </div>
  );
}
