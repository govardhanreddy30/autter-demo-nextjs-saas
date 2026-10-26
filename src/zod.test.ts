import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("zod array validation resource limits (GHSA-mrhx-c7xc-m3w5)", () => {
  test("caps accumulated issues when validating a large failing array", () => {
    const schema = z.array(z.number()).max(100);
    const hugeInvalidArray = new Array(20_000).fill("not-a-number");

    const result = schema.safeParse(hugeInvalidArray);

    expect(result.success).toBe(false);
    // Before the fix (zod < 4.6.6), the size bound ran after every element was
    // parsed, so each failing element produced an issue with no cap, letting an
    // attacker exhaust memory with an oversized array.
    expect(result.error.issues.length).toBeLessThan(hugeInvalidArray.length);
  });
});
