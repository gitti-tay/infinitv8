import type { Decimal } from "@/generated/prisma/internal/prismaNamespace";

export function toNum(value: Decimal | number): number {
  return typeof value === "number" ? value : Number(value);
}
