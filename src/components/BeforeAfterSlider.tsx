import { MoveHorizontal } from "lucide-react";
import { useRef, useState } from "react";

type BeforeAfterSliderProps = {
  beforeImage: string;
  afterImage: string;
  beforeAlt: string;
  afterAlt: string;
  beforeCaption?: string;
  afterCaption?: string;
  isPlaceholder?: boolean;
};

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeAlt,
  afterAlt,
  beforeCaption = "До",
  afterCaption = "После",
  isPlaceholder = false,
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [beforeError, setBeforeError] = useState(false);
  const [afterError, setAfterError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  function updateFromClientX(clientX: number) {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const raw = ((clientX - rect.left) / Math.max(1, rect.width)) * 100;
    setPosition(Math.min(100, Math.max(0, Math.round(raw))));
  }

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        onPointerDown={(e) => {
          setDragging(true);
          e.currentTarget.setPointerCapture(e.pointerId);
          updateFromClientX(e.clientX);
        }}
        onPointerMove={(e) => {
          if (!dragging) return;
          updateFromClientX(e.clientX);
        }}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        className="relative aspect-[4/3] w-full select-none overflow-hidden rounded-xl border border-zinc-200 bg-zinc-950 touch-none dark:border-zinc-800"
      >
        {afterError ? (
          <FallbackImage label={afterCaption} />
        ) : (
          <img
            src={afterImage}
            alt={afterAlt}
            referrerPolicy="no-referrer"
            onError={() => setAfterError(true)}
            className="h-full w-full object-cover"
            draggable={false}
          />
        )}

        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          {beforeError ? (
            <FallbackImage label={beforeCaption} />
          ) : (
            <img
              src={beforeImage}
              alt={beforeAlt}
              referrerPolicy="no-referrer"
              onError={() => setBeforeError(true)}
              className="h-full w-full object-cover"
              draggable={false}
            />
          )}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/85 via-black/45 to-transparent px-4 pt-8 pb-3 text-xs font-medium text-zinc-100">
          <span>{beforeCaption}</span>
          <span>{afterCaption}</span>
        </div>

        <div
          className="pointer-events-none absolute inset-y-0 w-px bg-white/90 shadow-[0_0_8px_rgba(0,0,0,0.65)]"
          style={{ left: `${position}%` }}
        >
          <div className="absolute top-1/2 left-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-zinc-950/90 text-white shadow-md">
            <MoveHorizontal className="size-4" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-800 dark:bg-zinc-900">
          <button
            type="button"
            onClick={() => setPosition(100)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              position >= 85
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            Только до
          </button>
          <button
            type="button"
            onClick={() => setPosition(50)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              position > 15 && position < 85
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            Сравнение 50/50
          </button>
          <button
            type="button"
            onClick={() => setPosition(0)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              position <= 15
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            Только после
          </button>
        </div>

        <label className="flex min-w-[140px] flex-1 items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="sr-only">Позиция сравнения до и после</span>
          <input
            type="range"
            min={0}
            max={100}
            value={position}
            onChange={(e) => setPosition(Number(e.target.value))}
            aria-label="Сравнение до и после в процентах"
            className="w-full accent-blue-600"
          />
          <span className="w-9 text-right tabular-nums">{position}%</span>
        </label>
      </div>

      {isPlaceholder ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Временная схема макета — замените в админ-панели на фотографии выполненной работы «ГрафФар».
        </p>
      ) : null}
    </div>
  );
}

function FallbackImage({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-950 to-slate-900 p-6 text-center text-sm text-zinc-400">
      <span>{label}</span>
    </div>
  );
}
