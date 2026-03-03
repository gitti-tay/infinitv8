import { describe, expect, it } from "vitest";

import { registerSchema } from "../auth";

describe("registerSchema", () => {
  it("validates valid input", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "password123",
      name: "Test User",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({
      email: "not-an-email",
      password: "password123",
      name: "Test",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email).toBeDefined();
    }
  });

  it("rejects short password", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "short",
      name: "Test",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.password).toBeDefined();
    }
  });

  it("rejects empty name", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "password123",
      name: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    const result = registerSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
