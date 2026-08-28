"use client";

import { OVERSEAS_REGION, REGION_SUB_MAX_LENGTH, REGION_TOPS, subsFor } from "@/lib/regions";

export interface RegionSelectProps {
  top: string;
  sub: string;
  onTopChange(value: string): void;
  onSubChange(value: string): void;
  error?: string;
  idPrefix: string;
  disabled?: boolean;
  labels: { top: string; sub: string; overseasPlaceholder: string };
}

export default function RegionSelect({
  top,
  sub,
  onTopChange,
  onSubChange,
  error,
  idPrefix,
  disabled = false,
  labels,
}: RegionSelectProps) {
  const topId = `${idPrefix}-region-top`;
  const subId = `${idPrefix}-region-sub`;
  const errorId = `${idPrefix}-region-error`;
  const isOverseas = top === OVERSEAS_REGION;
  const subs = isOverseas ? [] : subsFor(top);
  const subHasOptions = subs.length > 0;
  // 세종특별자치시처럼 하위 행정구역이 없는 시·도는 sub가 빈 문자열이어야 유효하다
  // (isValidRegionPair 참고). 고를 것이 없는 select를 required로 두면 접근성 트리에
  // 잘못된 신호를 주므로, 옵션이 없을 때는 required를 걸지 않고 select 자체를 잠근다.
  const subRequired = isOverseas || subHasOptions;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label
          htmlFor={topId}
          className="block text-[15px] font-semibold mb-2 text-[var(--color-text)]"
        >
          {labels.top}
        </label>
        <select
          id={topId}
          required
          value={top}
          disabled={disabled}
          onChange={(event) => {
            onTopChange(event.target.value);
            onSubChange("");
          }}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className="paper-field min-h-[48px] focus:outline-none focus:ring-2 focus:ring-[var(--color-warm)]/30 transition"
        >
          <option value="" disabled>
            {labels.top}
          </option>
          {REGION_TOPS.map((regionName) => (
            <option key={regionName} value={regionName}>
              {regionName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor={subId}
          className="block text-[15px] font-semibold mb-2 text-[var(--color-text)]"
        >
          {labels.sub}
        </label>
        {isOverseas ? (
          <input
            id={subId}
            type="text"
            required
            value={sub}
            disabled={disabled}
            onChange={(event) => onSubChange(event.target.value)}
            placeholder={labels.overseasPlaceholder}
            maxLength={REGION_SUB_MAX_LENGTH}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            className="paper-field min-h-[48px] focus:outline-none focus:ring-2 focus:ring-[var(--color-warm)]/30 transition"
          />
        ) : (
          <select
            id={subId}
            required={subRequired}
            value={sub}
            disabled={disabled || !top || !subHasOptions}
            onChange={(event) => onSubChange(event.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            className="paper-field min-h-[48px] focus:outline-none focus:ring-2 focus:ring-[var(--color-warm)]/30 transition disabled:opacity-60"
          >
            <option value="" disabled>
              {labels.sub}
            </option>
            {subs.map((subName) => (
              <option key={subName} value={subName}>
                {subName}
              </option>
            ))}
          </select>
        )}
      </div>

      {error && (
        <p id={errorId} className="sm:col-span-2 -mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
