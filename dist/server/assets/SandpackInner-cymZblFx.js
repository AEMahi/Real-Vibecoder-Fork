import { jsxs, jsx } from "react/jsx-runtime";
import { useEffect } from "react";
import { SandpackProvider, SandpackLayout, SandpackPreview, useSandpack } from "@codesandbox/sandpack-react";
function ErrorListener({ onError }) {
  const { sandpack, listen } = useSandpack();
  useEffect(() => {
    if (!onError) return;
    const stop = listen((msg) => {
      if (msg.type === "action" && msg.action === "show-error") {
        const text = [msg.title, msg.message].filter(Boolean).join(": ");
        onError(text);
      }
      if (msg.type === "start") onError(null);
      if (msg.type === "done" && msg.compilatonError === false) onError(null);
    });
    return () => stop();
  }, [listen, onError]);
  useEffect(() => {
    if (!onError) return;
    const e = sandpack.error;
    if (e?.message) onError(e.message);
  }, [sandpack, onError]);
  return null;
}
function SandpackInner({
  files,
  onError
}) {
  return /* @__PURE__ */ jsxs(
    SandpackProvider,
    {
      template: "react-ts",
      files,
      theme: "dark",
      customSetup: {
        dependencies: { react: "^19.2.0", "react-dom": "^19.2.0" }
      },
      children: [
        /* @__PURE__ */ jsx(ErrorListener, { onError }),
        /* @__PURE__ */ jsx(SandpackLayout, { style: { height: "100%", border: 0 }, children: /* @__PURE__ */ jsx(
          SandpackPreview,
          {
            showNavigator: true,
            showRefreshButton: true,
            showOpenInCodeSandbox: false,
            style: { height: "100%" }
          }
        ) })
      ]
    }
  );
}
export {
  SandpackInner as default
};
