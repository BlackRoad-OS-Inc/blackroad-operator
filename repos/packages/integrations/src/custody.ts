import { v4 as uuid } from "uuid";
import { AccountFeePlan } from "@lucidia/core";

export interface CustodyDeductionRequest {
  plan: AccountFeePlan;
  invoiceId: string;
  amount: number;
  currency: string;
  evidenceUri?: string;
}

export interface CustodyDeductionReceipt {
  id: string;
  status: "Submitted" | "Confirmed";
  submittedAt: Date;
  confirmationRef?: string;
}

export async function submitCustodyDeduction(
  request: CustodyDeductionRequest
): Promise<CustodyDeductionReceipt> {
  return {
    id: uuid(),
    status: "Submitted",
    submittedAt: new Date(),
  };
}

export interface CustodyPacketInput {
  custodian: string;
  accountApp: Record<string, unknown>;
}

export function buildPacket(input: CustodyPacketInput): Buffer {
  const payload = JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      custodian: input.custodian,
      accountApp: input.accountApp,
    },
    null,
    2,
  );
  return Buffer.from(payload, "utf-8");
}
