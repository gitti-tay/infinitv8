import { describe, expect, it } from "vitest";

import { toNum } from "../decimal";

describe("toNum", () => {
  it("converts a number to itself", () => {
    expect(toNum(42)).toBe(42);
  });

  it("converts a Decimal-like object to number", () => {
    const decimalLike = {
      toString: () => "18.5",
      valueOf: () => 18.5,
      [Symbol.toPrimitive]: () => 18.5,
    };
    expect(Number(decimalLike)).toBe(18.5);
  });

  it("handles zero", () => {
    expect(toNum(0)).toBe(0);
  });

  it("handles negative numbers", () => {
    expect(toNum(-10.5)).toBe(-10.5);
  });
});
