import { NextResponse } from "next/server";

import { auditLog, requireAdmin } from "@/lib/admin";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

const VALID_CATEGORIES = ["REAL_ESTATE", "AGRICULTURE", "HEALTHCARE", "COMMODITIES"];
const VALID_STATUSES = ["ACTIVE", "SOLD_OUT", "COMING_SOON"];
const VALID_RISK_LEVELS = ["LOW", "MEDIUM", "HIGH"];

const REQUIRED_PROJECT_FIELDS = [
  "name",
  "ticker",
  "description",
  "location",
  "category",
  "apy",
  "term",
  "riskLevel",
  "targetAmount",
] as const;

export async function GET(request: Request) {
  try {
    const adminResult = await requireAdmin();
    if ("error" in adminResult) return adminResult.error;

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const status = searchParams.get("status") || undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (status) where.status = status;

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          investments: {
            where: { status: "CONFIRMED" },
            select: { amount: true, userId: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);

    const data = projects.map((p) => {
      const totalFunded = p.investments.reduce(
        (sum, inv) => sum + Number(inv.amount),
        0
      );
      const uniqueInvestors = new Set(p.investments.map((inv) => inv.userId)).size;

      return {
        id: p.id,
        name: p.name,
        ticker: p.ticker,
        category: p.category,
        status: p.status,
        apy: Number(p.apy),
        term: p.term,
        riskLevel: p.riskLevel,
        targetAmount: Number(p.targetAmount),
        raisedPercent: Number(p.raisedPercent),
        minInvestment: Number(p.minInvestment),
        totalFunded,
        investorCount: uniqueInvestors,
        createdAt: p.createdAt,
      };
    });

    return NextResponse.json({
      projects: data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error({ err: error }, "Admin: Failed to fetch projects");
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const adminResult = await requireAdmin();
    if ("error" in adminResult) return adminResult.error;

    const body = await request.json();

    // Validate required fields
    const missingFields = REQUIRED_PROJECT_FIELDS.filter(
      (field) => body[field] === undefined || body[field] === null || body[field] === ""
    );
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    if (!VALID_CATEGORIES.includes(body.category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}` },
        { status: 400 }
      );
    }

    if (body.status && !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    if (!VALID_RISK_LEVELS.includes(body.riskLevel)) {
      return NextResponse.json(
        { error: `Invalid riskLevel. Must be one of: ${VALID_RISK_LEVELS.join(", ")}` },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name: body.name,
        ticker: body.ticker,
        description: body.description,
        location: body.location,
        category: body.category,
        apy: body.apy,
        term: body.term,
        riskLevel: body.riskLevel,
        status: body.status || "COMING_SOON",
        targetAmount: body.targetAmount,
        minInvestment: body.minInvestment || 500,
        imageUrl: body.imageUrl || null,
        payout: body.payout || "Monthly",
        tagline: body.tagline || null,
        investmentThesis: body.investmentThesis || null,
        keyHighlights: body.keyHighlights || null,
        termSheet: body.termSheet || null,
        payoutWaterfall: body.payoutWaterfall || null,
        diligenceItems: body.diligenceItems || null,
        faqs: body.faqs || null,
        documents: body.documents || null,
        plans: body.plans || null,
        badge: body.badge || null,
      },
    });

    await auditLog(adminResult.userId, "CREATE_PROJECT", project.id, {
      name: project.name,
      ticker: project.ticker,
    });

    return NextResponse.json(
      {
        ...project,
        apy: Number(project.apy),
        raisedPercent: Number(project.raisedPercent),
        targetAmount: Number(project.targetAmount),
        minInvestment: Number(project.minInvestment),
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error({ err: error }, "Admin: Failed to create project");
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
