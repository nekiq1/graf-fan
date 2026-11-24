import "@fontsource/manrope/400.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/ibm-plex-mono/500.css";

import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { useEffect } from "react";
import { Layout } from "@/components/Layout";
import { NotFoundComponent } from "@/components/not-found";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  notFoundComponent: NotFoundComponent,

  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "ГрафФар — Студия автосвета и детейлинга в Санкт-Петербурге" },
      {
        name: "description",
        content:
          "Студия автосвета и детейлинга ГрафФар (Санкт-Петербург, Гранитная ул., 51): установка Bi-LED линз, ремонт и полировка фар, антигравийная плёнка, шумоизоляция, калькулятор стоимости.",
      },
      { name: "theme-color", content: "#0B0C10" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "ГрафФар" },
    ],
    links: [
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "preload", as: "image", href: "/images/graffar/hero-bmw-clean.jpg" },
      { rel: "stylesheet", href: appCss },
    ],
  }),

  component: RootDocument,
});

function RootDocument() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);

  return (
    <html lang="ru" className="dark" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <Layout>
          <Outlet />
        </Layout>
        <Scripts />
      </body>
    </html>
  );
}
