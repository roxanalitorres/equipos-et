import { j as jsxRuntimeExports, t as Button } from "./index-DJt2JjiO.js";
function EmptyState({
  icon,
  title,
  description,
  action,
  ocid
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": ocid,
      className: "flex flex-col items-center justify-center py-16 px-6 text-center",
      children: [
        icon && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground", children: icon }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display font-semibold text-foreground text-base mb-1", children: title }),
        description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground max-w-xs", children: description }),
        action && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            "data-ocid": action.ocid,
            onClick: action.onClick,
            className: "mt-4",
            variant: "default",
            children: action.label
          }
        )
      ]
    }
  );
}
export {
  EmptyState as E
};
