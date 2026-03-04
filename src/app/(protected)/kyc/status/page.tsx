import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/ui/header";
import Link from "next/link";
import { redirect } from "next/navigation";

import { KycStatusClient } from "./client";

function getStatusConfig(status: string) {
  switch (status) {
    case "APPROVED":
      return {
        icon: "check_circle",
        iconBg: "bg-accent/10",
        iconColor: "text-accent-light",
        heading: "Identity Verified",
        headingColor: "text-accent-light",
        description:
          "Congratulations! Your identity has been verified. You now have full access to the platform.",
        shouldRefresh: false,
      };
    case "REJECTED":
      return {
        icon: "error",
        iconBg: "bg-destructive/10",
        iconColor: "text-destructive",
        heading: "Verification Unsuccessful",
        headingColor: "text-destructive",
        description:
          "Your identity verification was not approved. Please check the details and try again with valid documents.",
        shouldRefresh: false,
      };
    case "NONE":
      return {
        icon: "info",
        iconBg: "bg-primary/10",
        iconColor: "text-primary",
        heading: "Verification Not Started",
        headingColor: "text-text-primary",
        description:
          "You haven't started identity verification yet. Complete KYC to unlock all features.",
        shouldRefresh: false,
      };
    default:
      return {
        icon: "hourglass_top",
        iconBg: "bg-amber/10",
        iconColor: "text-amber",
        heading: "Verification In Progress",
        headingColor: "text-text-primary",
        description:
          "Your documents have been submitted and are being reviewed. This typically takes 5-30 minutes during business hours.",
        shouldRefresh: true,
      };
  }
}

export default async function KycStatusPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { kycVerification: true },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  const config = getStatusConfig(user.kycStatus);
  const referenceId = user.kycVerification?.id || "N/A";

  return (
    <>
      <Header title="Verification Status" />
      <div className="pt-16 pb-24 md:pb-8 px-5 animate-fadeIn">
        {/* Status Card */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-soft mt-6">
          <div className="text-center py-8">
            {/* Status Icon */}
            <div
              className={`w-20 h-20 rounded-full ${config.iconBg} flex items-center justify-center mx-auto mb-5`}
            >
              <span
                className={`material-symbols-outlined ${config.iconColor} text-[40px]`}
              >
                {config.icon}
              </span>
            </div>

            {/* Status Info */}
            <h2 className={`text-[22px] font-extrabold mb-2 ${config.headingColor}`}>
              {config.heading}
            </h2>
            <p className="text-sm text-text-tertiary max-w-[400px] mx-auto">
              {config.description}
            </p>

            {/* Timer for Pending */}
            {user.kycStatus === "PENDING" && (
              <KycStatusClient
                referenceId={referenceId}
                shouldRefresh={config.shouldRefresh}
              />
            )}

            {/* Action Buttons */}
            <div className="mt-6 space-y-3 max-w-sm mx-auto">
              {user.kycStatus === "APPROVED" && (
                <Link
                  href="/dashboard"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-accent text-white text-center font-semibold rounded-lg hover:bg-accent-dark transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  Go to Dashboard
                </Link>
              )}

              {user.kycStatus === "NONE" && (
                <Link
                  href="/kyc"
                  className="block w-full py-3 bg-primary text-white text-center font-semibold rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Start Verification
                </Link>
              )}

              {user.kycStatus === "PENDING" && (
                <Link
                  href="/dashboard"
                  className="block w-full py-3 bg-background-tertiary border border-border text-text-secondary text-center font-semibold rounded-lg hover:bg-card-hover transition-colors"
                >
                  Back to Dashboard
                </Link>
              )}

              {user.kycStatus === "REJECTED" && (
                <>
                  <Link
                    href="/kyc/verify"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white text-center font-semibold rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">refresh</span>
                    Try Again
                  </Link>
                  <Link
                    href="/dashboard"
                    className="block w-full py-3 bg-background-tertiary border border-border text-text-secondary text-center font-semibold rounded-lg hover:bg-card-hover transition-colors"
                  >
                    Back to Dashboard
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Reference ID card (for non-NONE statuses) */}
        {referenceId !== "N/A" && user.kycStatus !== "PENDING" && (
          <div className="bg-card border border-border rounded-xl p-4 shadow-soft mt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-wider">
                  Reference ID
                </p>
                <p className="text-sm font-mono font-bold text-text-primary mt-0.5">
                  {referenceId}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
