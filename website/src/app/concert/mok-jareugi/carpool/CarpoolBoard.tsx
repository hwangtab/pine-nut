"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, Clock, MapPin, Undo2 } from "lucide-react";
import {
  CARPOOL_RETURN_LABEL,
  CARPOOL_SAME_DAY_RETURN_LABEL,
  CARPOOL_VEHICLES,
  type CarpoolVehicle,
} from "@/lib/carpool";

type Taken = Record<string, number[]>;

interface Selection {
  vehicleId: string;
  seatNo: number;
}

interface Confirmed {
  vehicle: CarpoolVehicle;
  name: string;
}

export default function CarpoolBoard() {
  const [taken, setTaken] = useState<Taken | null>(null);
  const [closed, setClosed] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [confirmed, setConfirmed] = useState<Confirmed | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/carpool", { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { taken: Taken; closed: boolean };
      setTaken(data.taken);
      setClosed(data.closed);
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (confirmed) {
    const { vehicle, name } = confirmed;
    return (
      <div className="paper mt-10 p-6 sm:p-8" role="status">
        <div className="relative z-[1]">
          <CheckCircle2 className="h-10 w-10 text-[var(--color-forest)]" aria-hidden />
          <h2 className="mt-4 break-keep font-serif-display text-2xl font-bold text-[var(--color-text)]">
            {name}님, {vehicle.name}에 자리를 잡았어요
          </h2>
          <dl className="mt-5 space-y-2 text-lg text-[var(--color-text)]">
            <div className="flex gap-3">
              <dt className="w-16 shrink-0 font-bold text-[var(--color-text-muted)]">출발</dt>
              <dd>
                {vehicle.departurePlace} · {vehicle.departureTime ?? "시각은 따로 안내드려요"}
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-16 shrink-0 font-bold text-[var(--color-text-muted)]">귀환</dt>
              <dd className="break-keep">
                {vehicle.sameDayReturn ? CARPOOL_SAME_DAY_RETURN_LABEL : CARPOOL_RETURN_LABEL}
              </dd>
            </div>
          </dl>
          <p className="mt-5 break-keep text-[15px] leading-relaxed text-[var(--color-text-muted)]">
            출발 전에 남겨주신 번호로 연락드립니다.
          </p>
          <button
            type="button"
            onClick={() => {
              setConfirmed(null);
              load();
            }}
            className="letter-btn letter-btn--outline-light mt-6"
          >
            차량 목록으로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10">
      {loadError && (
        <p className="mb-6 rounded-2xl border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-5 py-4 text-[15px] text-[var(--color-danger)]">
          빈자리 정보를 불러오지 못했습니다.{" "}
          <button type="button" onClick={load} className="font-bold underline">
            다시 불러오기
          </button>
        </p>
      )}
      {closed && (
        <p className="mb-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-warm)] px-5 py-4 text-[15px] font-semibold text-[var(--color-text)]">
          카풀 신청이 마감되었습니다.
        </p>
      )}

      <ul className="grid gap-5 sm:grid-cols-2">
        {CARPOOL_VEHICLES.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            takenSeats={taken?.[vehicle.id] ?? null}
            disabled={closed || taken === null}
            selectedSeat={selection?.vehicleId === vehicle.id ? selection.seatNo : null}
            onSelect={(seatNo) => setSelection({ vehicleId: vehicle.id, seatNo })}
            onCancel={() => setSelection(null)}
            onSeatLost={load}
            onConfirmed={(name) => {
              setSelection(null);
              setConfirmed({ vehicle, name });
            }}
          />
        ))}
      </ul>
    </div>
  );
}

function VehicleCard({
  vehicle,
  takenSeats,
  disabled,
  selectedSeat,
  onSelect,
  onCancel,
  onSeatLost,
  onConfirmed,
}: {
  vehicle: CarpoolVehicle;
  takenSeats: number[] | null;
  disabled: boolean;
  selectedSeat: number | null;
  onSelect: (seatNo: number) => void;
  onCancel: () => void;
  onSeatLost: () => void;
  onConfirmed: (name: string) => void;
}) {
  const seats = Array.from({ length: vehicle.openSeats }, (_, i) => i + 1);
  const remaining = takenSeats === null ? null : vehicle.openSeats - takenSeats.length;
  const full = remaining === 0;

  return (
    <li className={`paper p-6 ${full ? "opacity-60" : ""}`}>
      <div className="relative z-[1]">
        <div className="flex items-start justify-between gap-3">
          <h2 className="break-keep text-xl font-bold text-[var(--color-text)]">{vehicle.name}</h2>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold ${
              full
                ? "bg-[var(--color-border)] text-[var(--color-text-muted)]"
                : "bg-[var(--color-forest)] text-white"
            }`}
          >
            {remaining === null ? "…" : full ? "마감" : `${remaining}석 남음`}
          </span>
        </div>

        <ul className="mt-4 space-y-1.5 text-[15px] text-[var(--color-text)]">
          <li className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-[var(--color-warm)]" aria-hidden />
            <span>
              <b className="text-lg">{vehicle.departurePlace}</b> 출발
            </span>
          </li>
          <li className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-[var(--color-warm)]" aria-hidden />
            {vehicle.departureTime ?? "출발 시각 추후 안내"}
          </li>
          <li className="flex items-start gap-2 text-[var(--color-text-muted)]">
            <Undo2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span className="break-keep">
              {vehicle.sameDayReturn ? CARPOOL_SAME_DAY_RETURN_LABEL : CARPOOL_RETURN_LABEL}
            </span>
          </li>
        </ul>

        <p className="mt-5 text-sm font-semibold text-[var(--color-text-muted)]">
          자리 고르기 <span className="font-normal">(이미 {vehicle.boardedCount}명 탑승)</span>
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {seats.map((seatNo) => {
            const isTaken = takenSeats?.includes(seatNo) ?? false;
            const isSelected = selectedSeat === seatNo;
            return (
              <button
                key={seatNo}
                type="button"
                disabled={disabled || isTaken}
                aria-pressed={isSelected}
                aria-label={`${vehicle.name} ${seatNo}번 자리${isTaken ? " (신청 완료)" : ""}`}
                onClick={() => onSelect(seatNo)}
                className={`h-12 w-12 rounded-xl border-2 text-base font-bold transition-colors ${
                  isTaken
                    ? "cursor-not-allowed border-transparent bg-[var(--color-border)] text-[var(--color-text-muted)] line-through"
                    : isSelected
                      ? "border-[var(--color-warm)] bg-[var(--color-warm)] text-white"
                      : "border-[var(--color-forest)] bg-white text-[var(--color-forest)] hover:bg-[var(--color-bg-moss)] disabled:cursor-wait disabled:opacity-50"
                }`}
              >
                {seatNo}
              </button>
            );
          })}
        </div>

        {selectedSeat !== null && (
          <RiderForm
            vehicle={vehicle}
            seatNo={selectedSeat}
            onCancel={onCancel}
            onSeatLost={onSeatLost}
            onConfirmed={onConfirmed}
          />
        )}
      </div>
    </li>
  );
}

function RiderForm({
  vehicle,
  seatNo,
  onCancel,
  onSeatLost,
  onConfirmed,
}: {
  vehicle: CarpoolVehicle;
  seatNo: number;
  onCancel: () => void;
  onSeatLost: () => void;
  onConfirmed: (name: string) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/carpool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId: vehicle.id, seatNo, name, phone, consent }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.ok) {
        onConfirmed(name.trim());
        return;
      }
      setError(data.error ?? "신청하지 못했습니다. 잠시 뒤 다시 시도해주세요.");
      if (res.status === 409) onSeatLost();
    } catch {
      setError("연결이 끊겼습니다. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  const fieldClass =
    "mt-1 w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-base text-[var(--color-text)] focus:border-[var(--color-forest)] focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="mt-5 border-t border-[var(--color-border)] pt-5">
      <p className="text-[15px] font-bold text-[var(--color-text)]">
        {vehicle.name} {seatNo}번 자리 신청
      </p>
      <label className="mt-3 block text-sm font-semibold text-[var(--color-text-muted)]">
        이름
        <input
          required
          maxLength={30}
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={fieldClass}
        />
      </label>
      <label className="mt-3 block text-sm font-semibold text-[var(--color-text-muted)]">
        휴대전화
        <input
          required
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="010-0000-0000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={fieldClass}
        />
      </label>
      <label className="mt-4 flex items-start gap-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-forest)]"
        />
        <span className="break-keep">
          카풀 연락을 위해 이름과 휴대전화 번호를 모으는 데 동의합니다. 공연이 끝나면 지웁니다.
        </span>
      </label>

      {error && (
        <p className="mt-3 text-sm font-semibold text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      )}

      <div className="mt-4 flex gap-2">
        <button type="submit" disabled={submitting} className="letter-btn letter-btn--primary flex-1 disabled:opacity-60">
          {submitting ? "신청 중…" : "신청하기"}
        </button>
        <button type="button" onClick={onCancel} className="letter-btn letter-btn--outline-light">
          취소
        </button>
      </div>
    </form>
  );
}
