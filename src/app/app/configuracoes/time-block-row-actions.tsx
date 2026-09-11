"use client";

import { useTransition } from "react";
import { deleteTimeBlock } from "@/app/actions/timeblocks";

export default function TimeBlockRowActions({
  blockId,
}: {
  blockId: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => deleteTimeBlock(blockId))}
      className="text-sm font-medium text-red-500 hover:text-red-700 disabled:opacity-60"
    >
      Remover
    </button>
  );
}
