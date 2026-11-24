import { Download, PlusSquare, Share, Smartphone, WifiOff, X } from "lucide-react";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(standalone);

    const ua = window.navigator.userAgent.toLowerCase();
    const ios =
      /iphone|ipad|ipod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(ios);
    setIsMobile(ios || /android|mobile/.test(ua));

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  return {
    isInstallable: Boolean(deferredPrompt),
    isInstalled,
    isIOS,
    isMobile,
    install,
  };
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine !== false);
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  return isOnline;
}

export function PWAInstallButton({
  variant = "compact",
}: {
  variant?: "compact" | "full";
}) {
  const { isInstallable, isInstalled, isIOS, isMobile, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) return null;
  if (!isInstallable && !isIOS && !isMobile) return null;

  async function handleClick() {
    if (isInstallable) {
      await install();
      return;
    }
    setShowGuide(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void handleClick()}
        className={
          variant === "full"
            ? "inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-900 transition-all duration-200 hover:bg-zinc-100 active:scale-[0.98] dark:border-zinc-700 dark:bg-[#1C1C1F] dark:text-zinc-100 dark:hover:bg-zinc-800 whitespace-nowrap"
            : "inline-flex h-10 items-center gap-1.5 rounded-xl border border-zinc-300 bg-white px-3.5 text-xs font-semibold text-zinc-900 transition-all duration-200 hover:bg-zinc-100 active:scale-[0.98] dark:border-zinc-700 dark:bg-[#141416] dark:text-zinc-100 dark:hover:bg-zinc-800 whitespace-nowrap shrink-0"
        }
      >
        {isInstallable ? (
          <Download className="size-4 text-blue-500 shrink-0" />
        ) : (
          <Smartphone className="size-4 text-amber-500 shrink-0" />
        )}
        <span>{isInstallable ? "Установить приложение" : "На экран «Домой»"}</span>
      </button>

      {showGuide ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Добавление ГрафФар на экран Домой"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 p-4 backdrop-blur-xs sm:items-center"
        >
          <div className="animate-graffar-in w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-[#141416]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src="/apple-touch-icon.png"
                  alt="Иконка ГрафФар"
                  className="size-12 rounded-xl border border-zinc-200 dark:border-zinc-800"
                />
                <div>
                  <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                    Добавить «ГрафФар» на экран Домой
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Быстрый запуск как приложение без адресной строки
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                aria-label="Закрыть подсказку"
                className="grid size-8 place-items-center rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="size-4" />
              </button>
            </div>

            {isIOS ? (
              <ol className="mt-5 space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
                <li className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-[#0B0C10]">
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-blue-600/15 text-blue-600 dark:text-blue-400">
                    <Share className="size-4" />
                  </span>
                  <span>
                    Нажмите кнопку <strong>«Поделиться»</strong> на панели Safari внизу экрана (или в
                    строке адреса).
                  </span>
                </li>
                <li className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-[#0B0C10]">
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    <PlusSquare className="size-4" />
                  </span>
                  <span>
                    Пролистайте меню и выберите пункт <strong>«На экран «Домой»»</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-[#0B0C10]">
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-emerald-500/15 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    3
                  </span>
                  <span>
                    Нажмите <strong>«Добавить»</strong> в правом верхнем углу — ярлык появится на
                    экране iPhone.
                  </span>
                </li>
              </ol>
            ) : (
              <ol className="mt-5 space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
                <li className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-[#0B0C10]">
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-blue-600/15 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                    1
                  </span>
                  <span>
                    Откройте меню браузера (кнопка <strong>⋮</strong> или{" "}
                    <strong>«Поделиться»</strong>).
                  </span>
                </li>
                <li className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-[#0B0C10]">
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    <PlusSquare className="size-4" />
                  </span>
                  <span>
                    Выберите <strong>«Добавить на главный экран»</strong> или{" "}
                    <strong>«Установить приложение»</strong>.
                  </span>
                </li>
              </ol>
            )}

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="mt-5 h-11 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700 active:scale-[0.98]"
            >
              Понятно
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 left-4 z-50 inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500 px-3.5 py-2 text-xs font-semibold text-black shadow-lg"
    >
      <WifiOff className="size-3.5 shrink-0" />
      <span>Офлайн-режим · сохранённые данные</span>
    </div>
  );
}
