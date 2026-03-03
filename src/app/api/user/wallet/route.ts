import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

const walletSchema = z.object({
  walletAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = walletSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { walletAddress: result.data.walletAddress },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error({ err: error }, "Wallet update failed");
    return NextResponse.json(
      { error: "Failed to update wallet" },
      { status: 500 }
    );
  }
}
