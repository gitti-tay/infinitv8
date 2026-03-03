import { describe, expect, it } from "vitest";

import { createInvestmentSchema } from "../investment";

describe("createInvestmentSchema", () => {
  it("validates valid input", () => {
    const result = createInvestmentSchema.safeParse({
      projectId: "clxyz123abc",
      amount: 1000,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative amount", () => {
    const result = createInvestmentSchema.safeParse({
      projectId: "clxyz123abc",
      amount: -100,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero amount", () => {
    const result = createInvestmentSchema.safeParse({
      projectId: "clxyz123abc",
      amount: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing projectId", () => {
    const result = createInvestmentSchema.safeParse({
      amount: 1000,
    });
    expect(result.success).toBe(false);
  });

  it("rejects string amount", () => {
    const result = createInvestmentSchema.safeParse({
      projectId: "clxyz123abc",
      amount: "1000",
    });
    expect(result.success).toBe(false);
  });
});
