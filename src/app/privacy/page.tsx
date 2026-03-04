import Link from "next/link";

export default function PrivacyPage() {
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

        <h1 className="text-2xl font-bold mb-6">Privacy Policy</h1>

        <div className="prose prose-sm dark:prose-invert space-y-4 text-text-muted">
          <p>
            <strong>Last updated:</strong> March 2026
          </p>

          <h2 className="text-lg font-semibold text-foreground">1. Information We Collect</h2>
          <p>
            We collect personal information you provide during registration and KYC
            verification, including your name, email, government-issued ID, and
            selfie. We also collect usage data and device information.
          </p>

          <h2 className="text-lg font-semibold text-foreground">2. How We Use Your Information</h2>
          <p>
            Your information is used to verify your identity, process investments,
            comply with regulatory requirements (AML/KYC), improve our services, and
            communicate with you about your account.
          </p>

          <h2 className="text-lg font-semibold text-foreground">3. KYC Data Processing</h2>
          <p>
            Identity verification is processed by our partner Sumsub. Your documents
            are encrypted in transit and at rest. We do not store your identity
            documents on our servers after verification is complete.
          </p>

          <h2 className="text-lg font-semibold text-foreground">4. Data Sharing</h2>
          <p>
            We do not sell your personal information. We may share data with
            regulatory authorities as required by law, and with service providers
            who assist in operating our platform under strict data protection agreements.
          </p>

          <h2 className="text-lg font-semibold text-foreground">5. Data Security</h2>
          <p>
            We use industry-standard encryption (TLS 1.3, AES-256) to protect your
            data. Access to personal information is restricted to authorized
            personnel only.
          </p>

          <h2 className="text-lg font-semibold text-foreground">6. Your Rights</h2>
          <p>
            You have the right to access, correct, or delete your personal data.
            To exercise these rights, contact us at{" "}
            <a href="mailto:privacy@infinitv8.com" className="text-primary">
              privacy@infinitv8.com
            </a>
          </p>

          <h2 className="text-lg font-semibold text-foreground">7. Data Retention</h2>
          <p>
            We retain your data for as long as your account is active and as
            required by applicable regulations. Investment records are retained
            for a minimum of 7 years per financial regulations.
          </p>
        </div>
      </div>
    </div>
  );
}
