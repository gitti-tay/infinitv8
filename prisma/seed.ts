import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // ── Clean up dependent data first, then projects ──
  await prisma.adminAuditLog.deleteMany();
  await prisma.userSettings.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.yieldPayout.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.walletBalance.deleteMany();
  await prisma.investment.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // ── Projects (individual creates to capture IDs for first 3) ──

  const projectSPPS = await prisma.project.create({
    data: {
      name: "Bloombase Sterile Potato Seed",
      ticker: "SPPS",
        tagline: "Earn from Thailand's premium organic potato supply chain — 6-month harvest cycles, up to 25% APY, USDC payouts.",
        description: "Blockchain-powered agricultural investment in premium organic potato farming across 500 rai in Chiang Mai highlands. Smart contracts automate yield distribution from harvest revenues directly to token holders. Current yield: 3,200 tons/year supplying major Thai retail chains and export markets. Fully transparent supply chain tracked on-chain with IoT soil monitoring. Certified organic by USDA and Thailand's ACT.",
        investmentThesis: "Thailand's organic produce market is growing at 18% CAGR, driven by health-conscious consumers and export demand from Japan and South Korea. Bloombase operates 500 rai of certified organic potato fields in Chiang Mai's fertile highlands, producing 3,200 tons annually. The Seed Cycle Note (SCN) structure lets investors participate in 6-month harvest cycles with revenue distributed in USDC after each cycle.\n\nKey advantages: (1) Established buyer contracts with CP ALL, Tops, and Villa Market guarantee 85% of output at pre-agreed prices; (2) IoT soil monitoring and blockchain traceability command a 40% price premium over conventional potatoes; (3) Government BOI incentives provide 8-year corporate tax exemption.",
        location: "Chiang Mai, Thailand",
        category: "AGRICULTURE",
        apy: 20.5,
        term: 19,
        riskLevel: "MEDIUM",
        status: "ACTIVE",
        raisedPercent: 24,
        targetAmount: 5000000,
        minInvestment: 5,
        imageUrl: "https://images.unsplash.com/photo-1508857650881-64475119d798?w=800&q=80",
        payout: "Semi-Annual",
        badge: "Seed Cycle Note",
        investors: 34,
        keyHighlights: [
          "500 rai certified organic farm in Chiang Mai highlands",
          "3,200 tons annual yield with 85% pre-contracted sales",
          "IoT soil monitoring + blockchain supply chain traceability",
          "40% price premium over conventional produce",
          "8-year BOI tax exemption",
          "USDA and Thailand ACT organic certification",
        ],
        termSheet: {
          issuer: "Bloombase Agri Co., Ltd.",
          tokenType: "Revenue Share Token (ERC-1400)",
          raiseSize: "$5,000,000",
          minInvestment: "$5",
          tenor: "19 Months",
          lockup: "6 Months",
          payoutSchedule: "Semi-Annual (per harvest cycle)",
          payoutCurrency: "USDC",
          targetYield: "20.5% – 25.0% APY",
          fees: "2% management fee",
          reserves: "5% biosecurity reserve fund",
          collateral: "Crop insurance + land lease assignment",
        },
        payoutWaterfall: [
          { step: 1, title: "Harvest Revenue Collection", desc: "Potato harvest sold to contracted buyers (CP ALL, Tops, Villa Market) with revenue deposited to escrow" },
          { step: 2, title: "Operating Expenses", desc: "Farm operations, labor, fertilizer, IoT maintenance (est. 45% of revenue)" },
          { step: 3, title: "Biosecurity Reserve", desc: "5% allocated to crop insurance and pest/disease contingency fund" },
          { step: 4, title: "Management Fee", desc: "2% annual management fee to Bloombase Agri" },
          { step: 5, title: "Investor Distribution", desc: "Remaining net revenue distributed pro-rata in USDC to all token holders" },
        ],
        diligenceItems: [
          { label: "Land Lease Agreement", status: "Verified", icon: "description" },
          { label: "Organic Certification (USDA + ACT)", status: "Verified", icon: "eco" },
          { label: "Crop Insurance Policy", status: "Active", icon: "security" },
          { label: "Buyer Contracts (CP ALL, Tops)", status: "Verified", icon: "handshake" },
          { label: "IoT Infrastructure Audit", status: "Completed", icon: "sensors" },
          { label: "Financial Audit (PwC)", status: "Completed", icon: "account_balance" },
          { label: "BOI Tax Incentive Certificate", status: "Verified", icon: "gavel" },
          { label: "Smart Contract Audit (CertiK)", status: "Passed", icon: "code" },
        ],
        faqs: [
          { q: "What is a Seed Cycle Note?", a: "A Seed Cycle Note (SCN) is a revenue share token that pays returns based on actual harvest cycle revenue. Each cycle is approximately 6 months, and returns are distributed in USDC after the harvest is sold." },
          { q: "What happens if a harvest fails?", a: "The farm is covered by crop insurance and maintains a 5% biosecurity reserve fund. In the event of partial crop loss, insurance payouts and reserves ensure investor principal protection." },
          { q: "How is the supply chain tracked?", a: "Every batch is tracked from seed to shelf using IoT soil sensors and blockchain traceability. Investors can verify production data in real-time through the platform dashboard." },
          { q: "What is the minimum investment?", a: "The minimum investment is $5 (USDT equivalent), making this accessible to everyone while maintaining institutional-grade structure." },
          { q: "Can I exit before maturity?", a: "After the 6-month lockup period, you may request early redemption during quarterly liquidity windows, subject to available liquidity." },
        ],
        documents: [
          { name: "Investment Memorandum", type: "PDF", size: "2.4 MB" },
          { name: "Organic Certification Bundle", type: "PDF", size: "1.1 MB" },
          { name: "Crop Insurance Policy", type: "PDF", size: "890 KB" },
          { name: "Smart Contract Audit Report", type: "PDF", size: "1.8 MB" },
          { name: "Financial Projections", type: "XLSX", size: "340 KB" },
          { name: "Land Lease Agreement", type: "PDF", size: "1.5 MB" },
        ],
        plans: [
          { name: "Starter", apy: 20.5, min: 5, term: 19, lockup: "6 months", payout: "Semi-Annual", badge: "Popular", description: "Standard access to harvest cycle returns" },
          { name: "Growth", apy: 22.5, min: 1000, term: 19, lockup: "6 months", payout: "Semi-Annual", badge: "Best Value", description: "Enhanced yield for committed investors" },
          { name: "Elite", apy: 25.0, min: 10000, term: 19, lockup: "12 months", payout: "Semi-Annual", badge: "Top Yield", description: "Maximum yield with priority waterfall position" },
        ],
    },
  });

  const projectMDD = await prisma.project.create({
    data: {
      name: "re:H Medical Device Distribution",
      ticker: "MDD",
        tagline: "Milestone-gated healthcare investment — up to 25% APY as Southeast Asia's medical supply chain scales.",
        description: "Southeast Asia's fastest-growing pharmaceutical and medical equipment distribution network. Serving 340+ hospitals and 1,200+ clinics across Thailand, Vietnam, and Cambodia. Exclusive distribution agreements with 8 global medical device manufacturers. Annual revenue of $12M with 22% net margins. ISO 13485 certified with cold-chain logistics infrastructure.",
        investmentThesis: "Southeast Asia's medical device market is projected to reach $18B by 2028, growing at 8.4% CAGR. re:H has built exclusive distribution partnerships with 8 global manufacturers including Medtronic, Olympus, and Karl Storz, serving 340+ hospitals across Thailand, Vietnam, and Cambodia.\n\nThe Milestone-Gated Revenue Share Note (MRSN) structure protects investors by releasing capital in tranches tied to verifiable distribution milestones. Revenue is generated from wholesale margins (22% net) on medical equipment and consumables, providing predictable cash flows backed by long-term hospital contracts.\n\nKey moat: Cold-chain logistics infrastructure across 3 countries — a $50M+ barrier to entry for competitors.",
        location: "Bangkok, Thailand",
        category: "HEALTHCARE",
        apy: 19.8,
        term: 24,
        riskLevel: "MEDIUM",
        status: "ACTIVE",
        raisedPercent: 10,
        targetAmount: 8000000,
        minInvestment: 5,
        imageUrl: "https://images.unsplash.com/photo-1770221797869-81e508282ac4?w=800&q=80",
        payout: "Quarterly",
        badge: "Milestone-Gated",
        investors: 18,
        keyHighlights: [
          "340+ hospitals and 1,200+ clinics served across 3 countries",
          "Exclusive distribution agreements with 8 global manufacturers",
          "$12M annual revenue with 22% net margins",
          "ISO 13485 certified quality management",
          "Cold-chain logistics across Thailand, Vietnam, Cambodia",
          "Milestone-gated capital release protects investor principal",
        ],
        termSheet: {
          issuer: "re:H Distribution Co., Ltd.",
          tokenType: "Milestone-Gated Revenue Share Note (MRSN)",
          raiseSize: "$8,000,000",
          minInvestment: "$5",
          tenor: "24 Months",
          lockup: "12 Months",
          payoutSchedule: "Quarterly (post-commercialization)",
          payoutCurrency: "USDC",
          targetYield: "19.8% – 25.0% APY",
          fees: "2.5% management fee",
          reserves: "8% working capital reserve",
          collateral: "Distribution contracts + inventory",
        },
        payoutWaterfall: [
          { step: 1, title: "Revenue Collection", desc: "Quarterly distribution revenue from hospital and clinic sales collected" },
          { step: 2, title: "Cost of Goods", desc: "Manufacturer purchase costs and logistics expenses (est. 65% of revenue)" },
          { step: 3, title: "Working Capital Reserve", desc: "8% allocated to inventory and accounts receivable buffer" },
          { step: 4, title: "Management Fee", desc: "2.5% annual management fee to re:H operations team" },
          { step: 5, title: "Investor Distribution", desc: "Net profit distributed quarterly in USDC, capped at 1.5x total return" },
        ],
        diligenceItems: [
          { label: "ISO 13485 Certification", status: "Verified", icon: "verified" },
          { label: "Distribution Agreements (8 MFR)", status: "Verified", icon: "handshake" },
          { label: "Hospital Contract Portfolio", status: "Verified", icon: "local_hospital" },
          { label: "Cold-Chain Audit (SGS)", status: "Completed", icon: "thermostat" },
          { label: "Financial Audit (Deloitte)", status: "Completed", icon: "account_balance" },
          { label: "Regulatory Licenses (3 Countries)", status: "Active", icon: "gavel" },
          { label: "Insurance Coverage", status: "Active", icon: "security" },
          { label: "Smart Contract Audit (Halborn)", status: "Passed", icon: "code" },
        ],
        faqs: [
          { q: "What is a Milestone-Gated Note?", a: "Capital is released in tranches tied to specific distribution milestones (e.g., new hospital contracts, revenue targets). This protects investors by ensuring funds are deployed only as the business hits verified growth targets." },
          { q: "What medical devices are distributed?", a: "re:H distributes surgical equipment, diagnostic devices, and hospital consumables from manufacturers including Medtronic, Olympus, Karl Storz, and 5 others." },
          { q: "How is revenue verified?", a: "All hospital purchase orders and invoices are tracked through the re:H ERP system with quarterly audits by Deloitte. Revenue milestones are verified by an independent trustee before payouts." },
          { q: "What is the return cap?", a: "The MRSN structure caps total investor returns at 1.5x the invested principal over the 24-month term." },
          { q: "Is this regulated?", a: "re:H holds medical device distribution licenses in Thailand (FDA), Vietnam (MOH), and Cambodia (MOH). The token structure is compliant with applicable securities guidelines." },
        ],
        documents: [
          { name: "Investment Memorandum", type: "PDF", size: "3.2 MB" },
          { name: "ISO 13485 Certificate", type: "PDF", size: "450 KB" },
          { name: "Distribution Agreement Summary", type: "PDF", size: "1.8 MB" },
          { name: "Financial Audit Report", type: "PDF", size: "2.1 MB" },
          { name: "Smart Contract Audit", type: "PDF", size: "1.4 MB" },
          { name: "Regulatory License Bundle", type: "PDF", size: "2.8 MB" },
        ],
        plans: [
          { name: "Starter", apy: 19.8, min: 5, term: 24, lockup: "12 months", payout: "Quarterly", badge: "Popular", description: "Standard access with milestone-gated capital protection" },
          { name: "Growth", apy: 22.0, min: 1000, term: 24, lockup: "12 months", payout: "Quarterly", badge: "Best Value", description: "Enhanced yield for committed investors" },
          { name: "Elite", apy: 25.0, min: 10000, term: 24, lockup: "18 months", payout: "Quarterly", badge: "Top Yield", description: "Maximum yield with priority allocation and working capital returns" },
        ],
    },
  });

  const projectKBB = await prisma.project.create({
    data: {
      name: "K-Beauty Clinic Bangkok",
      ticker: "KBB",
        tagline: "Premium Korean beauty clinic in Sukhumvit — monthly cashflow, up to 25% APY from Asia's booming aesthetics market.",
        description: "State-of-the-art Korean beauty and aesthetic medicine clinic in Bangkok's premium Sukhumvit district. Offering advanced Korean dermatology, cosmetic procedures, and anti-aging treatments. Treated 4,800+ international patients with a 96% satisfaction rate. Revenue has grown 42% YoY driven by Southeast Asia's $7.2B medical aesthetics market.",
        investmentThesis: "The medical aesthetics market in Southeast Asia is growing at 15% CAGR, with Bangkok emerging as the regional hub for Korean-standard beauty treatments. K-Beauty Clinic Bangkok operates a premium 800 sqm facility in Sukhumvit Soi 39, staffed by board-certified Korean dermatologists and surgeons.\n\nThe Clinic Cashflow Preferred (CCP) structure provides monthly distributions from operating revenue, offering investors steady income backed by strong patient demand. With 4,800+ patients served and a 96% satisfaction rate, the clinic has achieved $8.2M annual revenue with 35% operating margins.\n\nGrowth drivers: Rising medical tourism (2M+ visitors to Thailand annually for medical procedures), exclusive Korean technology partnerships, and premium pricing power from Korean-board-certified specialists.",
        location: "Sukhumvit, Bangkok",
        category: "HEALTHCARE",
        apy: 22.5,
        term: 18,
        riskLevel: "MEDIUM",
        status: "ACTIVE",
        raisedPercent: 15,
        targetAmount: 4000000,
        minInvestment: 5,
        imageUrl: "https://images.unsplash.com/photo-1731514721772-329626f84c8b?w=800&q=80",
        payout: "Monthly",
        badge: "Cashflow Preferred",
        investors: 22,
        keyHighlights: [
          "Premium 800 sqm clinic in Sukhumvit Soi 39, Bangkok",
          "4,800+ international patients with 96% satisfaction rate",
          "$8.2M annual revenue with 35% operating margins",
          "Board-certified Korean dermatologists and surgeons",
          "42% year-over-year revenue growth",
          "Monthly cashflow distributions to investors",
        ],
        termSheet: {
          issuer: "KBB Aesthetics Co., Ltd.",
          tokenType: "Clinic Cashflow Preferred (CCP)",
          raiseSize: "$4,000,000",
          minInvestment: "$5",
          tenor: "18 Months",
          lockup: "6 Months",
          payoutSchedule: "Monthly",
          payoutCurrency: "USDC",
          targetYield: "19.5% – 25.0% APY",
          fees: "2% management fee",
          reserves: "5% equipment maintenance reserve",
          collateral: "Clinic equipment + patient receivables",
        },
        payoutWaterfall: [
          { step: 1, title: "Monthly Revenue Collection", desc: "Patient treatment fees and product sales collected via clinic POS and insurance claims" },
          { step: 2, title: "Operating Expenses", desc: "Staff salaries, medical supplies, rent, marketing (est. 55% of revenue)" },
          { step: 3, title: "Equipment Reserve", desc: "5% allocated to medical equipment maintenance and upgrade fund" },
          { step: 4, title: "Management Fee", desc: "2% annual management fee to KBB operations" },
          { step: 5, title: "Investor Distribution", desc: "Monthly net cashflow distributed in USDC to CCP token holders" },
        ],
        diligenceItems: [
          { label: "Medical License (Thai MOH)", status: "Active", icon: "local_hospital" },
          { label: "Clinic Inspection Report", status: "Passed", icon: "verified" },
          { label: "Korean Board Certifications", status: "Verified", icon: "badge" },
          { label: "Patient Satisfaction Audit", status: "96% Score", icon: "sentiment_satisfied" },
          { label: "Financial Audit (KPMG)", status: "Completed", icon: "account_balance" },
          { label: "Insurance Coverage", status: "Active", icon: "security" },
          { label: "Equipment Valuation", status: "Verified", icon: "biotech" },
          { label: "Smart Contract Audit (Trail of Bits)", status: "Passed", icon: "code" },
        ],
        faqs: [
          { q: "What is Clinic Cashflow Preferred?", a: "CCP tokens provide monthly distributions from the clinic's operating cashflow. As a preferred investor, you receive payouts before equity holders, providing steady monthly income." },
          { q: "What treatments does the clinic offer?", a: "The clinic specializes in Korean dermatology (skin resurfacing, laser treatments), cosmetic surgery (rhinoplasty, blepharoplasty), injectable aesthetics (Botox, fillers), and anti-aging programs." },
          { q: "How stable is the revenue?", a: "The clinic has achieved 42% YoY revenue growth with a diversified patient mix: 40% Thai locals, 35% medical tourists, 25% expats. Recurring treatments comprise 60% of revenue." },
          { q: "What is the minimum investment?", a: "The minimum investment is $5 (USDT equivalent). A Flex 12-month plan is also available, and Pro investors can access enhanced yields at higher tiers." },
          { q: "What happens if the clinic underperforms?", a: "Monthly payouts are variable based on actual revenue. The 5% equipment reserve and insurance coverage provide downside protection." },
        ],
        documents: [
          { name: "Investment Memorandum", type: "PDF", size: "2.8 MB" },
          { name: "Medical License Certificate", type: "PDF", size: "560 KB" },
          { name: "Patient Satisfaction Report", type: "PDF", size: "1.2 MB" },
          { name: "Financial Projections", type: "XLSX", size: "420 KB" },
          { name: "Smart Contract Audit Report", type: "PDF", size: "1.6 MB" },
          { name: "Equipment Valuation Report", type: "PDF", size: "980 KB" },
        ],
        plans: [
          { name: "Flex", apy: 19.5, min: 5, term: 12, lockup: "3 months", payout: "Monthly", badge: null, description: "Shorter commitment with flexible redemption" },
          { name: "Starter", apy: 22.5, min: 5, term: 18, lockup: "6 months", payout: "Monthly", badge: "Popular", description: "Full-term access to clinic cashflow returns" },
          { name: "Growth", apy: 24.0, min: 1000, term: 18, lockup: "6 months", payout: "Monthly", badge: "Best Value", description: "Enhanced yield for committed investors" },
          { name: "Elite", apy: 25.0, min: 10000, term: 18, lockup: "12 months", payout: "Monthly", badge: "Top Yield", description: "Maximum yield with priority cashflow allocation" },
        ],
    },
  });

  // Remaining projects (no ID capture needed)
  await prisma.project.createMany({
    data: [
      {
        name: "Zero-Emission Waste Recycle Plant",
        ticker: "WRP",
        tagline: "Founders-close infrastructure deal — up to 25% APY from Thailand's largest zero-emission waste processing facility.",
        description: "Utility-scale zero-emission waste recycling facility on Thailand's Eastern Seaboard, processing 500 tons of municipal solid waste daily. Converts waste to energy and recyclable materials using patented pyrolysis technology. 25-year waste processing agreement with 3 provincial municipalities. Carbon credits provide additional revenue uplift.",
        investmentThesis: "Thailand generates 28M tons of waste annually, with only 35% properly processed. Government mandates require 75% waste processing by 2030, creating a massive infrastructure gap. WRP's patented pyrolysis technology processes 500 tons/day of municipal solid waste into clean energy and recyclable materials.\n\nThe Founders Close structure offers early investors a 25% yield uplift over the Base tranche, rewarding participation at the capital formation stage. Revenue comes from three streams: (1) waste processing fees under 25-year municipal contracts, (2) energy sales to the PEA grid, and (3) carbon credit sales on the voluntary carbon market.\n\nWith $2.1M already raised from 28 institutional and accredited investors, the project is well-capitalized and construction is 40% complete with a Q3 2026 operational target.",
        location: "Eastern Seaboard, Thailand",
        category: "COMMODITIES",
        apy: 23.5,
        term: 36,
        riskLevel: "MEDIUM",
        status: "ACTIVE",
        raisedPercent: 17,
        targetAmount: 12000000,
        minInvestment: 5,
        imageUrl: "https://images.unsplash.com/photo-1763315156830-07870b159121?w=800&q=80",
        payout: "Quarterly",
        badge: "Founders Close",
        investors: 28,
        keyHighlights: [
          "500 tons/day processing capacity with patented pyrolysis technology",
          "25-year waste processing agreements with 3 municipalities",
          "Triple revenue stream: processing fees + energy sales + carbon credits",
          "Construction 40% complete, operational target Q3 2026",
          "Carbon credits provide 8-12% additional revenue uplift",
          "Founders Close: 25% yield premium for early investors",
        ],
        termSheet: {
          issuer: "WRP Clean Energy Co., Ltd.",
          tokenType: "Founders Close Preferred (FCP) / Base Note",
          raiseSize: "$12,000,000",
          minInvestment: "$5",
          tenor: "36 Months",
          lockup: "12 Months",
          payoutSchedule: "Quarterly",
          payoutCurrency: "USDC",
          targetYield: "20.0% – 25.0% APY",
          fees: "2% management + 10% performance fee above hurdle",
          reserves: "10% DSRA (Debt Service Reserve Account)",
          collateral: "Plant equipment + municipal contracts + carbon credit forwards",
        },
        payoutWaterfall: [
          { step: 1, title: "Revenue Collection", desc: "Waste processing fees + energy sales to PEA grid + carbon credit sales" },
          { step: 2, title: "Operating Expenses", desc: "Plant operations, maintenance, labor, utilities (est. 40% of revenue)" },
          { step: 3, title: "DSRA Funding", desc: "10% allocated to Debt Service Reserve Account until fully funded" },
          { step: 4, title: "Management & Performance Fee", desc: "2% management fee + 10% performance fee on returns above 8% hurdle" },
          { step: 5, title: "FCP Distribution (Priority)", desc: "Founders Close holders receive 23.5% APY distribution first" },
          { step: 6, title: "Base Note Distribution", desc: "Remaining cashflow distributed to Base Note holders at 20% APY" },
        ],
        diligenceItems: [
          { label: "Environmental Impact Assessment", status: "Approved", icon: "eco" },
          { label: "Municipal Processing Agreements", status: "Signed", icon: "handshake" },
          { label: "Construction Progress Audit", status: "40% Complete", icon: "construction" },
          { label: "Technology Patent Verification", status: "Verified", icon: "biotech" },
          { label: "PEA Grid Connection Agreement", status: "Signed", icon: "bolt" },
          { label: "Financial Model Audit (EY)", status: "Completed", icon: "account_balance" },
          { label: "Carbon Credit Pre-Sales", status: "In Progress", icon: "forest" },
          { label: "Smart Contract Audit (OpenZeppelin)", status: "Passed", icon: "code" },
        ],
        faqs: [
          { q: "What is a Founders Close?", a: "The Founders Close Preferred (FCP) tranche offers early investors a premium yield (23.5% vs 20% Base). FCP holders also receive priority in the payout waterfall. Elite investors ($10,000+) earn up to 25% APY." },
          { q: "When does the plant become operational?", a: "Construction is 40% complete with an operational target of Q3 2026. During construction, capital is held in escrow and released against verified milestones." },
          { q: "How do carbon credits work?", a: "The plant generates verified carbon credits by diverting waste from landfills. These credits are sold on the voluntary carbon market (Verra), providing 8-12% additional revenue." },
          { q: "What happens during construction?", a: "During construction, no payouts are made. Capital is milestone-gated. Full payouts begin once the plant is operational." },
          { q: "What is the DSRA?", a: "The Debt Service Reserve Account holds 6 months of debt service as a buffer, ensuring investor payouts continue even if short-term revenue fluctuates." },
        ],
        documents: [
          { name: "Investment Memorandum", type: "PDF", size: "4.2 MB" },
          { name: "Environmental Impact Assessment", type: "PDF", size: "3.8 MB" },
          { name: "Municipal Processing Agreements", type: "PDF", size: "2.4 MB" },
          { name: "Technology Patent Documentation", type: "PDF", size: "1.6 MB" },
          { name: "Construction Progress Report", type: "PDF", size: "2.8 MB" },
          { name: "Financial Model (EY Audited)", type: "XLSX", size: "580 KB" },
          { name: "Smart Contract Audit Report", type: "PDF", size: "1.4 MB" },
        ],
        plans: [
          { name: "Base Note", apy: 20.0, min: 5, term: 36, lockup: "12 months", payout: "Quarterly", badge: null, description: "Standard access to waste processing revenue" },
          { name: "Founders Close", apy: 23.5, min: 5, term: 36, lockup: "12 months", payout: "Quarterly", badge: "Founders", description: "Priority waterfall position + enhanced yield for early investors" },
          { name: "Elite", apy: 25.0, min: 10000, term: 36, lockup: "12 months", payout: "Quarterly", badge: "Top Yield", description: "Maximum yield with priority waterfall and enhanced allocation" },
        ],
      },
      {
        name: "Prime City Real Estate Income",
        ticker: "REI",
        tagline: "Tokenized income from premium Bangkok & Chiang Mai properties — up to 25% APY, quarterly net-rent distributions.",
        description: "Diversified real estate income fund investing in premium residential and commercial properties across Bangkok and Chiang Mai. Portfolio includes 12 properties generating stable rental income with 92% average occupancy and annual rental escalation clauses.",
        investmentThesis: "Bangkok's prime real estate yields 5-7% gross rental returns, among the highest in ASEAN. Prime City REI tokenizes a diversified portfolio of 12 income-generating properties across Bangkok's CBD and Chiang Mai's growing expat market.\n\nThe Property Income Token (PIT) structure provides quarterly net-rent distributions after all operating expenses, offering investors passive real estate income without the complexity of direct property ownership.\n\nThe portfolio is deliberately diversified across 3 property types (residential, serviced, commercial) and 2 cities to reduce concentration risk. All properties have annual rental escalation clauses of 3-5%, providing built-in inflation protection.\n\nWith 86 investors and $3.5M raised, this is our most popular offering — reflecting strong demand for stable, yield-generating real assets.",
        location: "Bangkok & Chiang Mai, Thailand",
        category: "REAL_ESTATE",
        apy: 18.5,
        term: 24,
        riskLevel: "LOW",
        status: "ACTIVE",
        raisedPercent: 35,
        targetAmount: 10000000,
        minInvestment: 5,
        imageUrl: "https://images.unsplash.com/photo-1573682195276-5642b7f27225?w=800&q=80",
        payout: "Quarterly",
        badge: "Income Token",
        investors: 86,
        keyHighlights: [
          "12 income-generating properties across Bangkok and Chiang Mai",
          "92% average occupancy with annual rental escalation clauses",
          "Diversified: residential, serviced apartments, commercial retail",
          "86 investors — most popular offering on the platform",
          "Quarterly net-rent distributions in USDC",
          "Built-in inflation protection via 3-5% annual rent escalation",
        ],
        termSheet: {
          issuer: "Prime City REIT Management Co., Ltd.",
          tokenType: "Property Income Token (PIT) / Property Development Note (PDN)",
          raiseSize: "$10,000,000",
          minInvestment: "$5",
          tenor: "24 Months",
          lockup: "6 Months",
          payoutSchedule: "Quarterly",
          payoutCurrency: "USDC",
          targetYield: "18.5% – 25.0% APY",
          fees: "1.5% management fee",
          reserves: "5% property maintenance reserve",
          collateral: "Property titles + rental assignment agreements",
        },
        payoutWaterfall: [
          { step: 1, title: "Rental Income Collection", desc: "Monthly rent collected from all 12 properties via property management company" },
          { step: 2, title: "Property Expenses", desc: "Maintenance, insurance, property tax, management fees (est. 30% of rental income)" },
          { step: 3, title: "Maintenance Reserve", desc: "5% allocated to property maintenance and renovation fund" },
          { step: 4, title: "Management Fee", desc: "1.5% annual management fee to Prime City REIT Management" },
          { step: 5, title: "PIT Distribution", desc: "Quarterly net rental income distributed to PIT holders at 18.5% APY" },
          { step: 6, title: "PDN Distribution", desc: "Development upside returns distributed to PDN holders at 21.5% APY" },
        ],
        diligenceItems: [
          { label: "Property Title Verification (12 Units)", status: "Verified", icon: "real_estate_agent" },
          { label: "Independent Property Valuation", status: "Completed", icon: "assessment" },
          { label: "Rental Agreement Portfolio", status: "Verified", icon: "description" },
          { label: "Occupancy Rate Audit", status: "92% Verified", icon: "apartment" },
          { label: "Property Insurance Coverage", status: "Active", icon: "security" },
          { label: "Financial Audit (BDO)", status: "Completed", icon: "account_balance" },
          { label: "Property Management Agreement", status: "Active", icon: "business" },
          { label: "Smart Contract Audit (Quantstamp)", status: "Passed", icon: "code" },
        ],
        faqs: [
          { q: "What is a Property Income Token?", a: "PIT tokens provide quarterly distributions from net rental income across the 12-property portfolio. It's similar to a REIT dividend but tokenized for fractional access starting at $5." },
          { q: "What types of properties are in the portfolio?", a: "The portfolio includes 5 luxury condominiums in Sukhumvit/Silom, 4 serviced apartments near BTS/MRT stations, and 3 commercial retail units." },
          { q: "What is the PDN option?", a: "The Property Development Note provides exposure to capital appreciation at 21.5% APY. PDN holders share in profits from property value increases with a 12-month lockup commitment. Elite investors ($10,000+) earn up to 25% APY." },
          { q: "How is occupancy maintained?", a: "Properties are managed by a professional management company. Premium locations near transit ensure consistently high occupancy at 92% average." },
          { q: "What happens if a tenant defaults?", a: "Security deposits (2-3 months rent) provide immediate buffer. The management company handles replacement within an average of 15 days." },
        ],
        documents: [
          { name: "Investment Memorandum", type: "PDF", size: "3.6 MB" },
          { name: "Property Portfolio Summary", type: "PDF", size: "4.2 MB" },
          { name: "Independent Valuation Report", type: "PDF", size: "2.8 MB" },
          { name: "Rental Agreement Summaries", type: "PDF", size: "1.9 MB" },
          { name: "Financial Audit Report", type: "PDF", size: "2.2 MB" },
          { name: "Smart Contract Audit Report", type: "PDF", size: "1.3 MB" },
        ],
        plans: [
          { name: "Starter", apy: 18.5, min: 5, term: 24, lockup: "6 months", payout: "Quarterly", badge: "Popular", description: "Quarterly net-rent income from diversified property portfolio" },
          { name: "Growth", apy: 21.5, min: 1000, term: 24, lockup: "12 months", payout: "Quarterly", badge: "Best Value", description: "Development upside + capital appreciation returns" },
          { name: "Elite", apy: 25.0, min: 10000, term: 24, lockup: "12 months", payout: "Quarterly", badge: "Top Yield", description: "Maximum yield with priority redemption and dedicated portfolio manager" },
        ],
      },
    ],
  });

  console.log("Seeded: 5 institutional-grade projects (SPPS, MDD, KBB, WRP, REI)");

  // ── Demo User ──
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@infinitv8.com" },
    update: {},
    create: {
      email: "demo@infinitv8.com",
      name: "Jun Kang",
      passwordHash: "$2b$12$demo.hash.placeholder",
      kycStatus: "APPROVED",
      role: "INVESTOR",
      walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
    },
  });

  // ── Admin User ──
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@infinitv8.com" },
    update: {},
    create: {
      email: "admin@infinitv8.com",
      name: "Admin",
      passwordHash: "$2b$12$admin.hash.placeholder",
      kycStatus: "APPROVED",
      role: "ADMIN",
    },
  });

  console.log("Seeded: demo user (demo@infinitv8.com) + admin user");

  // ── Investments (demoUser -> first 3 projects) ──
  const investmentSPPS = await prisma.investment.create({
    data: {
      userId: demoUser.id,
      projectId: projectSPPS.id,
      amount: 15000,
      status: "CONFIRMED",
    },
  });

  const investmentMDD = await prisma.investment.create({
    data: {
      userId: demoUser.id,
      projectId: projectMDD.id,
      amount: 12000,
      status: "CONFIRMED",
    },
  });

  const investmentKBB = await prisma.investment.create({
    data: {
      userId: demoUser.id,
      projectId: projectKBB.id,
      amount: 8000,
      status: "CONFIRMED",
    },
  });

  console.log("Seeded: 3 investments ($15k SPPS, $12k MDD, $8k KBB)");

  // ── Wallet Balances ──
  await prisma.walletBalance.createMany({
    data: [
      { userId: demoUser.id, asset: "USDT", network: "ERC20", balance: 5240, available: 5240 },
      { userId: demoUser.id, asset: "USDC", network: "ERC20", balance: 2300, available: 2300 },
      { userId: demoUser.id, asset: "ETH", network: "ERC20", balance: 0, available: 0 },
    ],
  });

  console.log("Seeded: 3 wallet balances (USDT, USDC, ETH)");

  // ── Transactions ──
  await prisma.transaction.createMany({
    data: [
      {
        userId: demoUser.id,
        type: "DEPOSIT",
        asset: "USDT",
        amount: 10000,
        status: "COMPLETED",
        description: "Deposit USDT",
        createdAt: new Date("2026-02-08"),
      },
      {
        userId: demoUser.id,
        type: "INVESTMENT",
        asset: "SPPS",
        amount: -15000,
        status: "COMPLETED",
        projectId: projectSPPS.id,
        description: "Investment in Bloombase Sterile Potato Seed",
        createdAt: new Date("2026-02-09"),
      },
      {
        userId: demoUser.id,
        type: "INVESTMENT",
        asset: "MDD",
        amount: -12000,
        status: "COMPLETED",
        projectId: projectMDD.id,
        description: "Investment in re:H Medical Device Distribution",
        createdAt: new Date("2026-02-10"),
      },
      {
        userId: demoUser.id,
        type: "INVESTMENT",
        asset: "KBB",
        amount: -8000,
        status: "COMPLETED",
        projectId: projectKBB.id,
        description: "Investment in K-Beauty Clinic Bangkok",
        createdAt: new Date("2026-02-10"),
      },
      {
        userId: demoUser.id,
        type: "YIELD",
        asset: "SPPS",
        amount: 125.50,
        status: "COMPLETED",
        projectId: projectSPPS.id,
        description: "Yield payout from SPPS",
        createdAt: new Date("2026-02-15"),
      },
      {
        userId: demoUser.id,
        type: "YIELD",
        asset: "MDD",
        amount: 89.20,
        status: "COMPLETED",
        projectId: projectMDD.id,
        description: "Yield payout from MDD",
        createdAt: new Date("2026-02-20"),
      },
      {
        userId: demoUser.id,
        type: "WITHDRAWAL",
        asset: "USDC",
        amount: -2000,
        status: "COMPLETED",
        description: "Withdrawal USDC",
        createdAt: new Date("2026-01-15"),
      },
      {
        userId: demoUser.id,
        type: "DEPOSIT",
        asset: "USDC",
        amount: 5000,
        status: "COMPLETED",
        description: "Deposit USDC",
        createdAt: new Date("2026-02-25"),
      },
    ],
  });

  console.log("Seeded: 8 transactions (deposits, investments, yields, withdrawal)");

  // ── Yield Payouts ──
  await prisma.yieldPayout.createMany({
    data: [
      // 3 past (paid)
      {
        userId: demoUser.id,
        projectId: projectSPPS.id,
        investmentId: investmentSPPS.id,
        amount: 125.50,
        payoutDate: new Date("2026-02-15"),
        paid: true,
        paidAt: new Date("2026-02-15"),
      },
      {
        userId: demoUser.id,
        projectId: projectMDD.id,
        investmentId: investmentMDD.id,
        amount: 89.20,
        payoutDate: new Date("2026-02-20"),
        paid: true,
        paidAt: new Date("2026-02-20"),
      },
      {
        userId: demoUser.id,
        projectId: projectKBB.id,
        investmentId: investmentKBB.id,
        amount: 64.80,
        payoutDate: new Date("2026-02-25"),
        paid: true,
        paidAt: new Date("2026-02-25"),
      },
      // 3 upcoming (unpaid)
      {
        userId: demoUser.id,
        projectId: projectSPPS.id,
        investmentId: investmentSPPS.id,
        amount: 125.50,
        payoutDate: new Date("2026-03-15"),
        paid: false,
      },
      {
        userId: demoUser.id,
        projectId: projectMDD.id,
        investmentId: investmentMDD.id,
        amount: 89.20,
        payoutDate: new Date("2026-03-20"),
        paid: false,
      },
      {
        userId: demoUser.id,
        projectId: projectKBB.id,
        investmentId: investmentKBB.id,
        amount: 64.80,
        payoutDate: new Date("2026-03-25"),
        paid: false,
      },
    ],
  });

  console.log("Seeded: 6 yield payouts (3 paid, 3 upcoming)");

  // ── Notifications ──
  await prisma.notification.createMany({
    data: [
      {
        userId: demoUser.id,
        type: "YIELD_RECEIVED",
        title: "Yield Received — SPPS",
        message: "$125.50 yield distributed",
        read: true,
        createdAt: new Date("2026-02-15"),
      },
      {
        userId: demoUser.id,
        type: "INVESTMENT_CONFIRMED",
        title: "Investment Confirmed — KBB",
        message: "$8,000 investment in K-Beauty Clinic",
        read: true,
        createdAt: new Date("2026-02-10"),
      },
      {
        userId: demoUser.id,
        type: "PAYOUT_SCHEDULED",
        title: "Upcoming Payout — SPPS",
        message: "Payout of $125.50 scheduled for Mar 15",
        read: false,
        createdAt: new Date("2026-03-10"),
      },
      {
        userId: demoUser.id,
        type: "KYC_UPDATE",
        title: "Identity Verified",
        message: "Your KYC verification has been approved",
        read: true,
        createdAt: new Date("2026-02-05"),
      },
      {
        userId: demoUser.id,
        type: "SYSTEM",
        title: "Welcome to INFINITV8",
        message: "Start exploring institutional-grade RWA investments",
        read: true,
        createdAt: new Date("2026-02-01"),
      },
    ],
  });

  console.log("Seeded: 5 notifications");

  // ── User Settings ──
  await prisma.userSettings.create({
    data: {
      userId: demoUser.id,
      biometricAuth: true,
      withdrawalWhitelist: true,
      emailConfirmWithdraw: true,
      theme: "dark",
    },
  });

  console.log("Seeded: user settings for demo user");

  // ── Admin Audit Log ──
  await prisma.adminAuditLog.create({
    data: {
      adminId: adminUser.id,
      action: "user.kyc.approve",
      target: demoUser.id,
      details: { reason: "KYC documents verified", approvedBy: "admin@infinitv8.com" },
    },
  });

  console.log("Seeded: 1 admin audit log entry");
  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
