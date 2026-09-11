"use client";

import { useActionState } from "react";
import {
  saveClientAnamnesis,
  type AnamnesisState,
} from "@/app/actions/anamnesis";
import { Button } from "@/components/ui/button";
import { inputClass, labelClass } from "@/lib/utils";

type Anamnesis = {
  allergies: string | null;
  skinNailConditions: string | null;
  medications: string | null;
  pregnantOrBreastfeeding: boolean;
  diabetes: boolean;
  preferences: string | null;
  notes: string | null;
} | null;

const initialState: AnamnesisState = {};

export default function AnamnesisForm({
  clientId,
  anamnesis,
}: {
  clientId: string;
  anamnesis: Anamnesis;
}) {
  const [state, formAction, pending] = useActionState(
    saveClientAnamnesis,
    initialState
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="clientId" value={clientId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Alergias</label>
          <input
            name="allergies"
            defaultValue={anamnesis?.allergies ?? ""}
            placeholder="Ex: alergia a látex, acetona..."
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
        <div>
          <label className={labelClass}>Condições de pele/unha</label>
          <input
            name="skinNailConditions"
            defaultValue={anamnesis?.skinNailConditions ?? ""}
            placeholder="Ex: unha fraca, psoríase, micose..."
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
        <div>
          <label className={labelClass}>Medicamentos em uso</label>
          <input
            name="medications"
            defaultValue={anamnesis?.medications ?? ""}
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
        <div>
          <label className={labelClass}>Preferências</label>
          <input
            name="preferences"
            defaultValue={anamnesis?.preferences ?? ""}
            placeholder="Ex: prefere sem cheiro forte, formato de unha..."
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
          <input
            type="checkbox"
            name="pregnantOrBreastfeeding"
            defaultChecked={anamnesis?.pregnantOrBreastfeeding ?? false}
            className="h-4 w-4 rounded border-zinc-300 text-rose-600 focus:ring-rose-500"
          />
          Grávida ou amamentando
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
          <input
            type="checkbox"
            name="diabetes"
            defaultChecked={anamnesis?.diabetes ?? false}
            className="h-4 w-4 rounded border-zinc-300 text-rose-600 focus:ring-rose-500"
          />
          Diabetes
        </label>
      </div>

      <div>
        <label className={labelClass}>Observações</label>
        <textarea
          name="notes"
          defaultValue={anamnesis?.notes ?? ""}
          rows={3}
          className={`mt-1.5 ${inputClass}`}
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-emerald-600">Ficha salva com sucesso!</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar ficha"}
      </Button>
    </form>
  );
}
