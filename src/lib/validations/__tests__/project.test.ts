import { describe, expect, it } from "vitest";

import { projectIdSchema, projectQuerySchema } from "../project";

describe("projectQuerySchema", () => {
  it("validates empty query (all optional)", () => {
    const result = projectQuerySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("validates valid category", () => {
    const result = projectQuerySchema.safeParse({ category: "HEALTHCARE" });
    expect(result.success).toBe(true);
  });

  it("validates valid status", () => {
    const result = projectQuerySchema.safeParse({ status: "ACTIVE" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid category", () => {
    const result = projectQuerySchema.safeParse({ category: "INVALID" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status", () => {
    const result = projectQuerySchema.safeParse({ status: "INVALID" });
    expect(result.success).toBe(false);
  });
});

describe("projectIdSchema", () => {
  it("validates valid id", () => {
    const result = projectIdSchema.safeParse({ id: "clxyz123abc" });
    expect(result.success).toBe(true);
  });

  it("rejects empty id", () => {
    const result = projectIdSchema.safeParse({ id: "" });
    expect(result.success).toBe(false);
  });
});
