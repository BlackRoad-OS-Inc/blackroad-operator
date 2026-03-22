/// <reference types="vitest" />

import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BootcampPage from "../apps/lucidia-earth/app/bootcamp/page";

describe("Lucidia bootcamp", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("persists oath and produces a ticket", async () => {
    const user = userEvent.setup();
    render(<BootcampPage />);

    expect(screen.getByText(/Step 1 — Oath/)).toBeInTheDocument();
    const submitButton = screen.getByRole("button", { name: /submit my first act/i });
    expect(submitButton).toBeDisabled();

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);
    expect(submitButton).not.toBeDisabled();

    await screen.findByText(/Match within tolerance/);
    const sliders = screen.getAllByRole("slider");
    fireEvent.change(sliders[0], { target: { value: "0.9" } });
    await waitFor(() => expect(screen.getByText(/Love leans toward/)).toBeInTheDocument());

    const proposal = screen.getByPlaceholderText(/review North Star/i);
    await user.type(proposal, "Ship a concise intake checklist for mentors.");

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ticketId: "LUC-TEST" }) } as Response));

    await user.click(submitButton);
    await waitFor(() => expect(screen.getByText(/Ticket issued: LUC-TEST/)).toBeInTheDocument());
  });
});
