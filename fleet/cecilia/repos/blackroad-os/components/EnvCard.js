import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { StatusPill } from "./StatusPill";
export function EnvCard({ env }) {
    return (_jsxs("div", { className: "env-card", children: [_jsx("div", { className: "env-region", style: { textTransform: "uppercase", fontSize: "0.85rem" }, children: env.region }), _jsx("h2", { children: env.name }), _jsxs("div", { children: ["Env ID: ", env.id] }), _jsx(StatusPill, { status: env.status })] }));
}
