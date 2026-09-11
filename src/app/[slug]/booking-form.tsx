"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { Clock, Check, User as UserIcon } from "lucide-react";
import {
  createPublicAppointment,
  type BookingState,
} from "@/app/actions/booking";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, inputClass, labelClass } from "@/lib/utils";

type Service = {
  id: string;
  name: string;
  durationMin: number;
  priceLabel: string;
};

type Staff = {
  id: string;
  name: string;
};

const initialState: BookingState = {};

function buildNextDays(count: number) {
  const days: { iso: string; weekday: string; day: number; month: string }[] =
    [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      iso: d.toISOString().slice(0, 10),
      weekday: d.toLocaleDateString("pt-BR", { weekday: "short" }),
      day: d.getDate(),
      month: d.toLocaleDateString("pt-BR", { month: "short" }),
    });
  }
  return days;
}

export default function BookingForm({
  slug,
  services,
  staff,
}: {
  slug: string;
  services: Service[];
  staff: Staff[];
}) {
  const days = useMemo(() => buildNextDays(14), []);
  const showStaffStep = staff.length > 1;

  const [selectedServiceId, setSelectedServiceId] = useState(
    services[0]?.id ?? ""
  );
  const [selectedStaffId, setSelectedStaffId] = useState(staff[0]?.id ?? "");
  const [selectedDate, setSelectedDate] = useState(days[0]?.iso ?? "");
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [state, formAction, pending] = useActionState(
    createPublicAppointment,
    initialState
  );

  const selectedService = services.find((s) => s.id === selectedServiceId);
  const selectedStaff = staff.find((s) => s.id === selectedStaffId);

  useEffect(() => {
    if (!selectedServiceId || !selectedStaffId || !selectedDate) return;

    let cancelled = false;

    async function loadSlots() {
      setLoadingSlots(true);
      setSelectedSlot(null);
      try {
        const res = await fetch(
          `/api/public/slots?slug=${encodeURIComponent(slug)}&serviceId=${encodeURIComponent(
            selectedServiceId
          )}&staffId=${encodeURIComponent(selectedStaffId)}&date=${selectedDate}`
        );
        const data = await res.json();
        if (!cancelled) setSlots(data.slots ?? []);
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    }

    loadSlots();

    return () => {
      cancelled = true;
    };
  }, [slug, selectedServiceId, selectedStaffId, selectedDate]);

  useEffect(() => {
    if (state.redirectUrl) {
      window.location.href = state.redirectUrl;
    }
  }, [state.redirectUrl]);

  if (services.length === 0 || staff.length === 0) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-zinc-500">
            Nenhum serviço disponível para agendamento no momento.
          </p>
        </CardContent>
      </Card>
    );
  }

  const stepOffset = showStaffStep ? 1 : 0;

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-3">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="startAt" value={selectedSlot ?? ""} />
      <input type="hidden" name="serviceId" value={selectedServiceId} />
      <input type="hidden" name="staffId" value={selectedStaffId} />

      <div className="space-y-6 lg:col-span-2">
        {showStaffStep && (
          <Card>
            <CardHeader>
              <CardTitle>1. Escolha o profissional</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2">
              {staff.map((s) => {
                const isSelected = s.id === selectedStaffId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedStaffId(s.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border p-3.5 text-left transition",
                      isSelected
                        ? "border-rose-500 bg-rose-50/60 ring-1 ring-rose-500"
                        : "border-zinc-200 hover:border-zinc-300"
                    )}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600">
                      {s.name.slice(0, 2).toUpperCase()}
                    </div>
                    <p className="flex-1 text-sm font-medium text-zinc-900">
                      {s.name}
                    </p>
                    {isSelected && (
                      <Check className="h-4 w-4 shrink-0 text-rose-600" />
                    )}
                  </button>
                );
              })}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{1 + stepOffset}. Escolha o serviço</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {services.map((s) => {
              const isSelected = s.id === selectedServiceId;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedServiceId(s.id)}
                  className={cn(
                    "flex items-start justify-between rounded-lg border p-3.5 text-left transition",
                    isSelected
                      ? "border-rose-500 bg-rose-50/60 ring-1 ring-rose-500"
                      : "border-zinc-200 hover:border-zinc-300"
                  )}
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-900">
                      {s.name}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {s.durationMin} min · {s.priceLabel}
                    </p>
                  </div>
                  {isSelected && (
                    <Check className="h-4 w-4 shrink-0 text-rose-600" />
                  )}
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{2 + stepOffset}. Escolha a data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {days.map((d) => {
                const isSelected = d.iso === selectedDate;
                return (
                  <button
                    key={d.iso}
                    type="button"
                    onClick={() => setSelectedDate(d.iso)}
                    className={cn(
                      "flex w-14 shrink-0 flex-col items-center rounded-lg border py-2.5 text-xs font-medium transition",
                      isSelected
                        ? "border-rose-500 bg-rose-600 text-white"
                        : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                    )}
                  >
                    <span className="capitalize opacity-80">
                      {d.weekday.replace(".", "")}
                    </span>
                    <span className="mt-1 text-base font-semibold">
                      {d.day}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{3 + stepOffset}. Escolha o horário</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSlots ? (
              <p className="text-sm text-zinc-400">Carregando horários...</p>
            ) : slots.length === 0 ? (
              <p className="text-sm text-zinc-400">
                Nenhum horário disponível nesta data.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {slots.map((slot) => {
                  const label = new Date(slot).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const isSelected = slot === selectedSlot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-sm font-medium transition",
                        isSelected
                          ? "border-rose-500 bg-rose-600 text-white"
                          : "border-zinc-200 text-zinc-700 hover:border-zinc-300"
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card className="lg:sticky lg:top-6">
          <CardHeader>
            <CardTitle>Seus dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedService && (
              <div className="rounded-lg bg-zinc-50 p-3 text-sm">
                <p className="font-medium text-zinc-800">
                  {selectedService.name}
                </p>
                {selectedStaff && (
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                    <UserIcon className="h-3.5 w-3.5" />
                    {selectedStaff.name}
                  </p>
                )}
                <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                  <Clock className="h-3.5 w-3.5" />
                  {selectedSlot
                    ? new Date(selectedSlot).toLocaleString("pt-BR", {
                        dateStyle: "long",
                        timeStyle: "short",
                      })
                    : "Selecione data e horário"}
                </p>
                <p className="mt-1 text-xs font-medium text-zinc-600">
                  {selectedService.priceLabel}
                </p>
              </div>
            )}

            <div>
              <label className={labelClass}>Seu nome</label>
              <input
                name="clientName"
                required
                className={`mt-1.5 ${inputClass}`}
              />
            </div>
            <div>
              <label className={labelClass}>Telefone</label>
              <input
                name="clientPhone"
                required
                placeholder="(11) 91234-5678"
                className={`mt-1.5 ${inputClass}`}
              />
            </div>
            <div>
              <label className={labelClass}>E-mail (para confirmação)</label>
              <input
                type="email"
                name="clientEmail"
                className={`mt-1.5 ${inputClass}`}
              />
            </div>

            {state.error && (
              <p className="text-sm text-red-600">{state.error}</p>
            )}

            <Button
              type="submit"
              disabled={pending || !selectedSlot || !selectedStaffId}
              className="w-full"
              size="lg"
            >
              {pending ? "Agendando..." : "Confirmar agendamento"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
