import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

interface SumsubWebhookPayload {
  applicantId: string;
  externalUserId: string;
  type: string;
  reviewResult?: {
    reviewAnswer: string;
  };
}

function mapReviewAnswer(answer: string) {
  switch (answer) {
    case "GREEN":
      return "APPROVED" as const;
    case "RED":
      return "REJECTED" as const;
    default:
      return "PENDING" as const;
  }
}

export async function POST(request: Request) {
  try {
    const payload: SumsubWebhookPayload = await request.json();

    const { externalUserId, type, reviewResult, applicantId } = payload;

    if (type !== "applicantReviewed") {
      return NextResponse.json({ ok: true });
    }

    if (!reviewResult) {
      return NextResponse.json({ ok: true });
    }

    const kycStatus = mapReviewAnswer(reviewResult.reviewAnswer);

    await prisma.kycVerification.update({
      where: { userId: externalUserId },
      data: {
        status: kycStatus,
        sumsubApplicantId: applicantId,
      },
    });

    await prisma.user.update({
      where: { id: externalUserId },
      data: { kycStatus },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("KYC webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
