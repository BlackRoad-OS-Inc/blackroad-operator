import { hashJournalEntry, withJournalHash } from "../src/utils/hashing";
import { toTimestamp } from "../src/utils/time";
import type { DomainEvent } from "../src/events/domainEvent";
import type { HashableJournalEntry } from "../src/utils/hashing";

describe("hashing helpers", () => {
  const event: DomainEvent = {
    id: "pssha∞_1111111111111111111111111111111111111111111111111111111111111111",
    type: "test.event",
    payload: { message: "hello" },
    severity: "info",
    timestamp: "2024-01-01T00:00:00.000Z",
  };

  const baseEntry: HashableJournalEntry = {
    id: "pssha∞_2222222222222222222222222222222222222222222222222222222222222222",
    event,
    previousHash: "pssha∞_previous_hash",
    timestamp: toTimestamp(new Date("2024-01-02T00:00:00.000Z")),
  };

  it("hashes journal entries deterministically", () => {
    const first = hashJournalEntry(baseEntry);
    const second = hashJournalEntry(baseEntry);
    expect(first).toBe(second);
  });

  it("changes hashes when data changes", () => {
    const entryWithHash = withJournalHash(baseEntry);
    const modifiedHash = hashJournalEntry({ ...baseEntry, previousHash: "different" });
    expect(entryWithHash.hash).not.toBe(modifiedHash);
  });

  it("formats timestamps consistently", () => {
    const date = new Date("2024-05-05T12:34:56.000Z");
    expect(toTimestamp(date)).toBe("2024-05-05T12:34:56.000Z");
  });
});
