import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.project.deleteMany();

  await prisma.project.createMany({
    data: [
      {
        name: "Stem Cell Therapy Clinic",
        ticker: "SCN",
        description: "State-of-the-art regenerative medicine clinic in Bangkok's premier medical district. Offering FDA-approved stem cell therapies for orthopedic, neurological, and anti-aging treatments. The clinic has treated 2,400+ international patients with a 94% satisfaction rate. Revenue has grown 35% YoY driven by Southeast Asia's booming $4.7B medical tourism industry. Licensed by Thailand's Ministry of Public Health with partnerships across 12 referring hospitals.",
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
        description: "Blockchain-powered agricultural investment in premium organic potato farming across 500 rai in Chiang Mai highlands. Smart contracts automate yield distribution from harvest revenues directly to token holders. Current yield: 3,200 tons/year supplying major Thai retail chains and export markets. Fully transparent supply chain tracked on-chain with IoT soil monitoring. Certified organic by USDA and Thailand's ACT.",
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
        name: "Medical Distribution Network",
        ticker: "MDD",
        description: "Southeast Asia's fastest-growing pharmaceutical and medical equipment distribution network. Serving 340+ hospitals and 1,200+ clinics across Thailand, Vietnam, and Cambodia. Exclusive distribution agreements with 8 global medical device manufacturers. Annual revenue of $12M with 22% net margins. ISO 13485 certified with cold-chain logistics infrastructure.",
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
        description: "Phase II expansion of award-winning luxury condotel on Phuket's west coast. 120 premium units with guaranteed rental returns through Marriott-managed hotel program. Phase I achieved 78% average occupancy and 19.2% investor returns. Beachfront location with infinity pool, spa, and private beach club. Expected completion Q4 2027. Pre-sales already at 40% with strong international buyer interest.",
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
      {
        name: "Solar Farm Grid",
        ticker: "SFG",
        description: "Utility-scale 50MW solar photovoltaic farm in Nakhon Ratchasima province with 25-year Power Purchase Agreement (PPA) with Thailand's EGAT. Generating stable, inflation-adjusted revenue from clean energy production. Built on 400 rai of leased land with tier-1 Jinko Solar panels and Huawei inverters. Project IRR of 16.5% backed by government feed-in tariff guarantees. Carbon credits provide additional 8-12% revenue uplift.",
        location: "Nakhon Ratchasima, Thailand",
        category: "COMMODITIES",
        apy: 16.5,
        term: 36,
        riskLevel: "LOW",
        status: "ACTIVE",
        raisedPercent: 45,
        targetAmount: 8000000,
        minInvestment: 1000,
        imageUrl: "/images/projects/sfg.jpg",
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
