import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createApplicant, getAccessToken } from "@/lib/sumsub";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { kycVerification: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let applicantId = user.kycVerification?.sumsubApplicantId;

    if (!applicantId) {
      const applicant = await createApplicant(user.id, user.email);
      applicantId = applicant.id;

      await prisma.kycVerification.upsert({
        where: { userId: user.id },
        update: { sumsubApplicantId: applicantId },
        create: {
          userId: user.id,
          sumsubApplicantId: applicantId,
          status: "PENDING",
        },
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { kycStatus: "PENDING" },
      });
    }

    const tokenData = await getAccessToken(user.id);

    return NextResponse.json({ token: tokenData.token });
  } catch (error) {
    console.error("KYC token error:", error);
    return NextResponse.json(
      { error: "Failed to generate KYC token" },
      { status: 500 }
    );
  }
}
