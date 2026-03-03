import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.project.createMany({
    data: [
      {
        name: "Stem Cell Therapy Clinic",
        ticker: "SCN",
        description: "State-of-the-art stem cell therapy clinic in Bangkok, Thailand. Offering regenerative medicine treatments with proven clinical outcomes and growing demand in Southeast Asian medical tourism market.",
        location: "Bangkok, Thailand",
        category: "HEALTHCARE",
        apy: 18.2,
        term: 12,
        riskLevel: "MEDIUM",
        status: "ACTIVE",
        raisedPercent: 25,
        targetAmount: 5000000,
        minInvestment: 750,
        imageUrl: "/images/projects/scn.jpg",
        payout: "Monthly",
      },
      {
        name: "Potato Tokenized Finance",
        ticker: "PTF",
        description: "Tokenized agricultural investment in premium potato farming operations in Chiang Mai, Thailand. Leveraging blockchain technology for transparent supply chain and yield distribution.",
        location: "Chiang Mai, Thailand",
        category: "AGRICULTURE",
        apy: 14.8,
        term: 6,
        riskLevel: "LOW",
        status: "ACTIVE",
        raisedPercent: 82,
        targetAmount: 2000000,
        minInvestment: 500,
        imageUrl: "/images/projects/ptf.jpg",
        payout: "Monthly",
      },
      {
        name: "Medical Distribution",
        ticker: "MDD",
        description: "Pharmaceutical and medical equipment distribution network across Southeast Asia. Established partnerships with major hospitals and clinics.",
        location: "Bangkok, Thailand",
        category: "HEALTHCARE",
        apy: 12.6,
        term: 18,
        riskLevel: "MEDIUM",
        status: "SOLD_OUT",
        raisedPercent: 100,
        targetAmount: 3000000,
        minInvestment: 1000,
        imageUrl: "/images/projects/mdd.jpg",
        payout: "Quarterly",
      },
      {
        name: "Luxury Condotel Phase II",
        ticker: "LCP2",
        description: "Phase II expansion of luxury condotel development in Phuket, Thailand. Premium beachfront property with hotel-managed rental program.",
        location: "Phuket, Thailand",
        category: "REAL_ESTATE",
        apy: 15.0,
        term: 24,
        riskLevel: "MEDIUM",
        status: "COMING_SOON",
        raisedPercent: 0,
        targetAmount: 10000000,
        minInvestment: 2000,
        imageUrl: "/images/projects/lcp2.jpg",
        payout: "Quarterly",
      },
    ],
  });

  console.log("Seed data created successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
