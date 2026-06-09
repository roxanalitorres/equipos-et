import { j as jsxRuntimeExports } from "./index-wAMx3mFr.js";
function Table({
  columns,
  data,
  rowKey,
  ocidPrefix,
  emptyMessage = "Sin datos",
  className = ""
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `overflow-x-auto ${className}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm border-collapse", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "bg-muted/50 border-b border-border", children: columns.map((col) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "th",
      {
        className: `px-3 py-2.5 text-left font-semibold text-muted-foreground uppercase tracking-wide text-xs ${col.headerClassName ?? ""}`,
        children: col.header
      },
      col.key
    )) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: data.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "td",
      {
        colSpan: columns.length,
        className: "px-3 py-8 text-center text-muted-foreground",
        "data-ocid": ocidPrefix ? `${ocidPrefix}.empty_state` : void 0,
        children: emptyMessage
      }
    ) }) : data.map((row, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "tr",
      {
        "data-ocid": ocidPrefix ? `${ocidPrefix}.item.${index + 1}` : void 0,
        className: "border-b border-border last:border-0 hover:bg-muted/30 transition-colors even:bg-muted/10",
        children: columns.map((col) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "td",
          {
            className: `px-3 py-2.5 text-foreground ${col.className ?? ""}`,
            children: col.render(row, index)
          },
          col.key
        ))
      },
      rowKey(row, index)
    )) })
  ] }) });
}
export {
  Table as T
};
