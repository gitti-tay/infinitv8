import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const chainProjectId = parseInt(id, 10);

  if (isNaN(chainProjectId)) {
    return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
  }

  const project = await prisma.project.findFirst({
    where: { chainProjectId },
  });

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    name: `INFINITV8 Investment - ${project.name}`,
    description: `Tokenized investment in ${project.name} via INFINITV8. ${project.ticker} - ${project.category} project in ${project.location}.`,
    image: project.imageUrl || `https://infinitv8.com/images/projects/${chainProjectId}.png`,
    external_url: `https://infinitv8.com/investments/${project.id}`,
    properties: {
      project_id: chainProjectId,
      ticker: project.ticker,
      category: project.category,
      apy: project.apy.toString(),
      term_months: project.term,
      risk_level: project.riskLevel,
      location: project.location,
    },
  });
}
