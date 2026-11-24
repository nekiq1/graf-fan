import { Link } from "@tanstack/react-router";
import { ArrowLeft, Home } from "lucide-react";

export function NotFoundComponent() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-white">
      <div className="max-w-xl text-center">
        <div className="text-7xl font-bold tracking-tight text-white/10">404</div>
        <h1 className="mt-4 text-3xl font-bold">Страница не найдена</h1>
        <p className="mt-4 text-white/60">
          Возможно, страница была перемещена или адрес указан с ошибкой.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Home size={18} />
            На главную
          </Link>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm transition hover:bg-white/10"
          >
            <ArrowLeft size={18} />
            Назад
          </button>
        </div>

        <div className="mt-12 text-xs tracking-[0.3em] text-white/30">ГРАФФАР</div>
      </div>
    </main>
  );
}
