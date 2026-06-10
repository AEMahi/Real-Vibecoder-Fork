import { createRootRoute, Outlet, ScrollRestoration, createFileRoute, lazyRouteComponent, createRouter as createRouter$1 } from "@tanstack/react-router";
import { jsxs, jsx } from "react/jsx-runtime";
const styles = "/assets/styles-Bp2qWXlS.css";
const Route$2 = createRootRoute({
  head: () => ({
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "AI Model Switcher Workspace" }
    ],
    links: [{ rel: "stylesheet", href: styles }]
  }),
  component: RootComponent
});
function RootComponent() {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx("link", { rel: "stylesheet", href: styles }) }),
    /* @__PURE__ */ jsxs("body", { className: "min-h-screen bg-background text-foreground antialiased", children: [
      /* @__PURE__ */ jsx(Outlet, {}),
      /* @__PURE__ */ jsx(ScrollRestoration, {})
    ] })
  ] });
}
const $$splitComponentImporter$1 = () => import("./index-CzZt3mwY.js");
const Route$1 = createFileRoute("/")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./p._projectId-DVMVKACv.js");
const Route = createFileRoute("/p/$projectId")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const IndexRoute = Route$1.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$2
});
const PProjectIdRoute = Route.update({
  id: "/p/$projectId",
  path: "/p/$projectId",
  getParentRoute: () => Route$2
});
const rootRouteChildren = {
  IndexRoute,
  PProjectIdRoute
};
const routeTree = Route$2._addFileChildren(rootRouteChildren)._addFileTypes();
function createRouter() {
  return createRouter$1({
    routeTree,
    defaultPreload: "intent"
  });
}
function getRouter() {
  return createRouter();
}
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  createRouter,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Route as R,
  router as r
};
