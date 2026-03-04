import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-dvh bg-bg-light dark:bg-bg-dark">
      <div className="max-w-2xl mx-auto px-5 py-12">
        <Link
          href="/auth/signup"
          className="inline-flex items-center gap-1 text-sm text-primary mb-8"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back
        </Link>

        <h1 className="text-2xl font-bold mb-6">Terms of Service</h1>

        <div className="prose prose-sm dark:prose-invert space-y-4 text-text-muted">
          <p>
            <strong>Last updated:</strong> March 2026
          </p>

          <h2 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the INFINITV8 platform, you agree to be bound by these
            Terms of Service. If you do not agree, do not use our services.
          </p>

          <h2 className="text-lg font-semibold text-foreground">2. Eligibility</h2>
          <p>
            You must be at least 18 years old and complete identity verification (KYC)
            to use investment features. You are responsible for maintaining the
            confidentiality of your account credentials.
          </p>

          <h2 className="text-lg font-semibold text-foreground">3. Investment Risks</h2>
          <p>
            All investments carry risk, including potential loss of principal. Past
            performance does not guarantee future results. INFINITV8 does not provide
            financial advice. You should consult with a qualified financial advisor
            before making investment decisions.
          </p>

          <h2 className="text-lg font-semibold text-foreground">4. Prohibited Activities</h2>
          <p>
            You may not use the platform for money laundering, terrorist financing,
            fraud, or any other illegal activity. Violation may result in account
            termination and reporting to authorities.
          </p>

          <h2 className="text-lg font-semibold text-foreground">5. Limitation of Liability</h2>
          <p>
            INFINITV8 is not liable for any losses arising from your use of the
            platform, including but not limited to investment losses, technical
            failures, or unauthorized access to your account.
          </p>

          <h2 className="text-lg font-semibold text-foreground">6. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Continued use of
            the platform constitutes acceptance of updated terms.
          </p>

          <h2 className="text-lg font-semibold text-foreground">7. Contact</h2>
          <p>
            For questions about these terms, contact us at{" "}
            <a href="mailto:support@infinitv8.com" className="text-primary">
              support@infinitv8.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
