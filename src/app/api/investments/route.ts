import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, amount } = await request.json();

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Project not accepting investments" },
        { status: 400 }
      );
    }

    if (amount < project.minInvestment) {
      return NextResponse.json(
        { error: `Minimum investment is $${project.minInvestment}` },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.kycStatus !== "APPROVED") {
      return NextResponse.json(
        { error: "KYC verification required" },
        { status: 403 }
      );
    }

    const investment = await prisma.investment.create({
      data: {
        userId: session.user.id,
        projectId,
        amount,
        status: "CONFIRMED",
      },
    });

    return NextResponse.json(investment, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Investment failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const investments = await prisma.investment.findMany({
      where: { userId: session.user.id },
      include: { project: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(investments);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch investments" },
      { status: 500 }
    );
  }
}
