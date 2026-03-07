"use client";

import { useRef, useState } from "react";

interface TermsStepProps {
  onContinue: () => void;
}

export function TermsStep({ onContinue }: TermsStepProps) {
  const termsRef = useRef<HTMLDivElement>(null);
  const riskRef = useRef<HTMLDivElement>(null);
  const [termsScrolled, setTermsScrolled] = useState(false);
  const [riskScrolled, setRiskScrolled] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [riskAccepted, setRiskAccepted] = useState(false);

  function handleScroll(ref: React.RefObject<HTMLDivElement | null>, setter: (v: boolean) => void) {
    const el = ref.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
      setter(true);
    }
  }

  const canProceed = termsAccepted && riskAccepted;

  return (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <h2 className="text-lg font-extrabold tracking-tight text-text-primary">
          Terms & Risk Disclosure
        </h2>
        <p className="text-sm text-text-muted">
          Please read through both documents and acknowledge your understanding
        </p>
      </div>

      {/* Terms of Service */}
      <div className="bg-card-light dark:bg-card-dark rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">description</span>
          <h3 className="font-bold text-sm">Terms of Service</h3>
          {termsScrolled && (
            <span className="material-symbols-outlined text-accent text-sm ml-auto">check_circle</span>
          )}
        </div>
        <div
          ref={termsRef}
          onScroll={() => handleScroll(termsRef, setTermsScrolled)}
          className="max-h-[250px] overflow-y-auto px-4 py-3 text-xs text-text-muted leading-relaxed space-y-3"
        >
          <p><strong>Last updated:</strong> March 2026</p>

          <p className="font-semibold text-text-secondary">1. Acceptance of Terms</p>
          <p>By accessing or using the INFINITV8 platform, you agree to be bound by these Terms of Service. If you do not agree, do not use our services.</p>

          <p className="font-semibold text-text-secondary">2. Eligibility</p>
          <p>You must be at least 18 years old and complete identity verification (KYC) to use investment features. You are responsible for maintaining the confidentiality of your account credentials.</p>

          <p className="font-semibold text-text-secondary">3. Investment Risks</p>
          <p>All investments carry risk, including potential loss of principal. Past performance does not guarantee future results. INFINITV8 does not provide financial advice. You should consult with a qualified financial advisor before making investment decisions.</p>

          <p className="font-semibold text-text-secondary">4. Prohibited Activities</p>
          <p>You may not use the platform for money laundering, terrorist financing, fraud, or any other illegal activity. Violation may result in account termination and reporting to authorities.</p>

          <p className="font-semibold text-text-secondary">5. Limitation of Liability</p>
          <p>INFINITV8 is not liable for any losses arising from your use of the platform, including but not limited to investment losses, technical failures, or unauthorized access to your account.</p>

          <p className="font-semibold text-text-secondary">6. Changes to Terms</p>
          <p>We reserve the right to modify these terms at any time. Continued use of the platform constitutes acceptance of updated terms.</p>

          <p className="font-semibold text-text-secondary">7. Contact</p>
          <p>For questions about these terms, contact us at support@infinitv8.com</p>
        </div>
        {!termsScrolled && (
          <div className="px-4 py-2 bg-primary/5 border-t border-primary/10 text-center">
            <p className="text-[10px] text-primary font-medium">Scroll to bottom to continue</p>
          </div>
        )}
      </div>

      {/* Terms checkbox */}
      <label className={`flex items-start gap-3 cursor-pointer ${!termsScrolled ? "opacity-50 pointer-events-none" : ""}`}>
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          disabled={!termsScrolled}
          className="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <span className="text-xs text-text-muted">
          I have read and agree to the <strong className="text-text-secondary">Terms of Service</strong>
        </span>
      </label>

      {/* Risk Disclosure */}
      <div className="bg-card-light dark:bg-card-dark rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-500 text-lg">warning</span>
          <h3 className="font-bold text-sm">Risk Disclosure</h3>
          {riskScrolled && (
            <span className="material-symbols-outlined text-accent text-sm ml-auto">check_circle</span>
          )}
        </div>
        <div
          ref={riskRef}
          onScroll={() => handleScroll(riskRef, setRiskScrolled)}
          className="max-h-[250px] overflow-y-auto px-4 py-3 text-xs text-text-muted leading-relaxed space-y-3"
        >
          <p><strong>Last updated:</strong> March 2026</p>

          <p>This Risk Disclosure statement is provided by INFINITV8 to ensure that all users understand the risks associated with investing in tokenized real-world assets (RWAs) through our platform.</p>

          <p className="font-semibold text-text-secondary">1. General Investment Risks</p>
          <p>All investments carry inherent risk, including the potential loss of your entire invested capital. Past performance does not guarantee future results. The value of your investment may go down as well as up.</p>

          <p className="font-semibold text-text-secondary">2. Tokenized Asset Risks</p>
          <p>Tokenized real-world assets involve additional risks including:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Smart contract vulnerabilities or exploits</li>
            <li>Blockchain network congestion or downtime</li>
            <li>Regulatory changes affecting tokenized assets</li>
            <li>Liquidity risk — tokens may not be easily tradeable before maturity</li>
            <li>Price volatility of underlying cryptocurrency</li>
          </ul>

          <p className="font-semibold text-text-secondary">3. Underlying Asset Risks</p>
          <p>Each asset class carries specific risks:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>Agriculture:</strong> Crop failure, weather events, commodity price fluctuations</li>
            <li><strong>Healthcare:</strong> Regulatory approvals, operational risks</li>
            <li><strong>Real Estate:</strong> Property value decline, vacancy risk, interest rate changes</li>
            <li><strong>Commodities:</strong> Construction delays, supply chain disruptions</li>
          </ul>

          <p className="font-semibold text-text-secondary">4. No Guarantee of Returns</p>
          <p>Projected yields (APY) are estimates based on historical performance and projections. Actual returns may differ materially. INFINITV8 does not guarantee any specific rate of return.</p>

          <p className="font-semibold text-text-secondary">5. Lock-Up Periods</p>
          <p>Most investments include a lock-up period during which you cannot redeem or transfer your tokens. Early redemption may be subject to penalties or may not be available.</p>

          <p className="font-semibold text-text-secondary">6. Regulatory Risks</p>
          <p>The regulatory landscape for digital assets is evolving. Changes in laws may adversely affect the use, transfer, or value of tokens.</p>

          <p className="font-semibold text-text-secondary">7. Technology Risks</p>
          <p>The platform relies on blockchain technology and smart contracts. No system is entirely immune to cyber attacks, technical failures, or unforeseen vulnerabilities.</p>

          <p className="font-semibold text-text-secondary">8. Not Financial Advice</p>
          <p>INFINITV8 does not provide financial, legal, or tax advice. Consult with qualified professional advisors before making any investment decisions.</p>

          <p className="font-semibold text-text-secondary">9. Suitability</p>
          <p>Investing in tokenized real-world assets may not be suitable for all investors. Only invest funds that you can afford to lose without affecting your financial stability.</p>
        </div>
        {!riskScrolled && (
          <div className="px-4 py-2 bg-amber-500/5 border-t border-amber-500/10 text-center">
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Scroll to bottom to continue</p>
          </div>
        )}
      </div>

      {/* Risk checkbox */}
      <label className={`flex items-start gap-3 cursor-pointer ${!riskScrolled ? "opacity-50 pointer-events-none" : ""}`}>
        <input
          type="checkbox"
          checked={riskAccepted}
          onChange={(e) => setRiskAccepted(e.target.checked)}
          disabled={!riskScrolled}
          className="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <span className="text-xs text-text-muted">
          I have read and understand the <strong className="text-text-secondary">Risk Disclosure</strong>, including that returns are not guaranteed and I may lose my entire investment
        </span>
      </label>

      {/* CTAs */}
      <div className="fixed bottom-16 md:bottom-0 left-0 md:left-64 right-0 z-40">
        <div className="max-w-5xl mx-auto px-5 pb-4 pt-3 bg-gradient-to-t from-bg-light dark:from-bg-dark">
          <button
            onClick={onContinue}
            disabled={!canProceed}
            className="w-full py-3.5 bg-primary text-white text-center font-bold rounded-xl shadow-glow hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            I Agree & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
