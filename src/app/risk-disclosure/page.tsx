import Link from "next/link";

export default function RiskDisclosurePage() {
  return (
    <div className="min-h-dvh bg-bg-light dark:bg-bg-dark">
      <div className="max-w-2xl mx-auto px-5 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-primary mb-8"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back
        </Link>

        <h1 className="text-2xl font-bold mb-6">Risk Disclosure</h1>

        <div className="prose prose-sm dark:prose-invert space-y-4 text-text-muted">
          <p>
            <strong>Last updated:</strong> March 2026
          </p>

          <p>
            This Risk Disclosure statement is provided by INFINITV8 to ensure
            that all users understand the risks associated with investing in
            tokenized real-world assets (RWAs) through our platform. Please
            read this document carefully before making any investment
            decisions.
          </p>

          <h2 className="text-lg font-semibold text-foreground">1. General Investment Risks</h2>
          <p>
            All investments carry inherent risk, including the potential loss
            of your entire invested capital. Past performance of any asset or
            investment product does not guarantee future results. The value of
            your investment may go down as well as up, and you may not recover
            the amount you originally invested.
          </p>

          <h2 className="text-lg font-semibold text-foreground">2. Tokenized Asset Risks</h2>
          <p>
            Tokenized real-world assets involve additional risks beyond
            traditional investments. These include but are not limited to:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Smart contract vulnerabilities or exploits, despite third-party audits</li>
            <li>Blockchain network congestion, downtime, or forks that may affect transactions</li>
            <li>Regulatory changes that could impact the legality or operation of tokenized assets</li>
            <li>Liquidity risk — tokens may not be easily tradeable or redeemable before maturity</li>
            <li>Price volatility of underlying cryptocurrency used for transactions (ETH, USDC, USDT)</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground">3. Underlying Asset Risks</h2>
          <p>
            Investments on INFINITV8 are backed by real-world assets including
            agriculture, healthcare, real estate, and commodities. Each asset
            class carries specific risks:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Agriculture:</strong> Crop failure, weather events, pest infestations, commodity price fluctuations</li>
            <li><strong>Healthcare:</strong> Regulatory approvals, operational risks, patient volume variability, insurance coverage changes</li>
            <li><strong>Real Estate:</strong> Property value decline, vacancy risk, tenant default, maintenance costs, interest rate changes</li>
            <li><strong>Commodities:</strong> Construction delays, technology risk, environmental compliance, supply chain disruptions</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground">4. No Guarantee of Returns</h2>
          <p>
            Projected yields (APY) displayed on the platform are estimates
            based on historical performance and financial projections. Actual
            returns may differ materially from projected returns. INFINITV8
            does not guarantee any specific rate of return or profit.
          </p>

          <h2 className="text-lg font-semibold text-foreground">5. Lock-Up Periods</h2>
          <p>
            Most investments on INFINITV8 include a lock-up period during
            which you cannot redeem or transfer your tokens. The lock-up
            period varies by project and investment plan. Early redemption may
            be subject to penalties or may not be available at all. Please
            review the specific terms of each investment before committing
            funds.
          </p>

          <h2 className="text-lg font-semibold text-foreground">6. Regulatory Risks</h2>
          <p>
            The regulatory landscape for digital assets and tokenized
            securities is evolving. Changes in laws, regulations, or
            government policies in any jurisdiction may adversely affect the
            use, transfer, or value of tokens. INFINITV8 operates in
            compliance with applicable laws but cannot guarantee that future
            regulatory changes will not impact your investments.
          </p>

          <h2 className="text-lg font-semibold text-foreground">7. Technology Risks</h2>
          <p>
            The platform relies on blockchain technology and smart contracts.
            While we employ industry-standard security measures (including
            third-party audits by firms such as CertiK, Trail of Bits, and
            Quantstamp), no system is entirely immune to cyber attacks,
            technical failures, or unforeseen vulnerabilities.
          </p>

          <h2 className="text-lg font-semibold text-foreground">8. Not Financial Advice</h2>
          <p>
            INFINITV8 does not provide financial, legal, or tax advice. The
            information on our platform is for informational purposes only
            and should not be considered a recommendation to buy, sell, or
            hold any investment. You should consult with qualified
            professional advisors before making any investment decisions.
          </p>

          <h2 className="text-lg font-semibold text-foreground">9. Suitability</h2>
          <p>
            Investing in tokenized real-world assets may not be suitable for
            all investors. You should only invest funds that you can afford
            to lose without affecting your financial stability or lifestyle.
            Consider your investment objectives, risk tolerance, and
            financial situation before investing.
          </p>

          <h2 className="text-lg font-semibold text-foreground">10. Contact</h2>
          <p>
            If you have questions about these risks or need further
            clarification, please contact us at{" "}
            <a href="mailto:support@infinitv8.com" className="text-primary hover:underline">
              support@infinitv8.com
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}
