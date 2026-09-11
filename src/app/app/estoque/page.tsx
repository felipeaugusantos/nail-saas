import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/session";
import { cn, formatCentsToBRL } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProductForm from "./product-form";
import ProductRowActions from "./product-row-actions";
import MovementForm from "./movement-form";

export default async function EstoquePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await requireOwner();
  const { tab: tabParam } = await searchParams;
  const tab = tabParam === "movimentacoes" ? "movimentacoes" : "produtos";

  const products = await prisma.product.findMany({
    where: { accountId: session.user.accountId },
    orderBy: { createdAt: "desc" },
  });

  const movements =
    tab === "movimentacoes"
      ? await prisma.stockMovement.findMany({
          where: { accountId: session.user.accountId },
          orderBy: { createdAt: "desc" },
          take: 50,
          include: { product: true },
        })
      : [];

  const MOVEMENT_LABELS: Record<string, string> = {
    IN: "Entrada",
    OUT: "Saída",
    ADJUSTMENT: "Ajuste",
  };

  return (
    <div>
      <PageHeader
        title="Estoque"
        description="Produtos e movimentações de estoque."
        action={
          <div className="flex gap-1 rounded-lg bg-zinc-100 p-1">
            <Link
              href="/app/estoque?tab=produtos"
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium",
                tab === "produtos"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              Produtos
            </Link>
            <Link
              href="/app/estoque?tab=movimentacoes"
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium",
                tab === "movimentacoes"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              Movimentações
            </Link>
          </div>
        }
      />

      {tab === "produtos" ? (
        <div>
          <ProductForm />

          <Card className="mt-6 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-left text-xs font-medium uppercase tracking-wide text-zinc-400">
                  <th className="px-5 py-3">Produto</th>
                  <th className="px-5 py-3">Custo</th>
                  <th className="px-5 py-3">Preço</th>
                  <th className="px-5 py-3">Estoque</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {products.map((product) => {
                  const isLow =
                    product.lowStockAlert > 0 &&
                    product.stockQty <= product.lowStockAlert;
                  return (
                    <tr key={product.id} className="hover:bg-zinc-50/60">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-zinc-800">
                          {product.name}
                        </p>
                        {product.sku && (
                          <p className="text-xs text-zinc-400">
                            SKU: {product.sku}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-zinc-600">
                        {formatCentsToBRL(product.costCents)}
                      </td>
                      <td className="px-5 py-3.5 text-zinc-600">
                        {formatCentsToBRL(product.priceCents)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-700">
                            {product.stockQty} {product.unit}
                          </span>
                          {isLow && <Badge variant="danger">Estoque baixo</Badge>}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={product.active ? "success" : "neutral"}>
                          {product.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <ProductRowActions
                          productId={product.id}
                          active={product.active}
                        />
                      </td>
                    </tr>
                  );
                })}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-zinc-400">
                      Nenhum produto cadastrado ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>
      ) : (
        <div>
          <MovementForm
            products={products.map((p) => ({
              id: p.id,
              name: p.name,
              unit: p.unit,
            }))}
          />

          <Card className="mt-6 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-left text-xs font-medium uppercase tracking-wide text-zinc-400">
                  <th className="px-5 py-3">Produto</th>
                  <th className="px-5 py-3">Tipo</th>
                  <th className="px-5 py-3">Quantidade</th>
                  <th className="px-5 py-3">Motivo</th>
                  <th className="px-5 py-3">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {movements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-zinc-50/60">
                    <td className="px-5 py-3.5 font-medium text-zinc-800">
                      {movement.product.name}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        variant={
                          movement.type === "IN"
                            ? "success"
                            : movement.type === "OUT"
                              ? "danger"
                              : "info"
                        }
                      >
                        {MOVEMENT_LABELS[movement.type]}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-600">
                      {movement.quantity} {movement.product.unit}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-600">
                      {movement.reason ?? "-"}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-600">
                      {movement.createdAt.toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
                {movements.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-zinc-400">
                      Nenhuma movimentação registrada ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </div>
  );
}
