import { jsx as _jsx } from "react/jsx-runtime";
const statusConfig = {
    healthy: { label: "Healthy", className: "status-pill status-pill--healthy" },
    degraded: { label: "Degraded", className: "status-pill status-pill--degraded" },
    down: { label: "Down", className: "status-pill status-pill--down" }
};
export function StatusPill({ status }) {
    const config = statusConfig[status];
    return _jsx("span", { className: config.className, children: config.label });
}
