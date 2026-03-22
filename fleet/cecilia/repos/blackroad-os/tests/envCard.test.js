import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from "@testing-library/react";
import { EnvCard } from "../components/EnvCard";
describe("EnvCard", () => {
    const env = {
        id: "env_123",
        name: "Production",
        region: "us-west-2",
        status: "healthy"
    };
    it("renders name, region, and id", () => {
        render(_jsx(EnvCard, { env: env }));
        expect(screen.getByText(env.region)).toBeInTheDocument();
        expect(screen.getByText(env.name)).toBeInTheDocument();
        expect(screen.getByText(`Env ID: ${env.id}`)).toBeInTheDocument();
    });
});
