import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from "@testing-library/react";
import { StatusPill } from "../components/StatusPill";
describe("StatusPill", () => {
    const cases = [
        ["healthy", "Healthy", "status-pill--healthy"],
        ["degraded", "Degraded", "status-pill--degraded"],
        ["down", "Down", "status-pill--down"]
    ];
    it.each(cases)("renders %s status", (status, label, className) => {
        render(_jsx(StatusPill, { status: status }));
        const pill = screen.getByText(label);
        expect(pill).toBeInTheDocument();
        expect(pill.className).toContain(className);
    });
});
