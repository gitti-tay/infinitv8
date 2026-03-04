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
        iconBg: "bg-green-100 dark:bg-green-900/30",
        iconColor: "text-green-500",
        heading: "Verification Approved",
        description:
          "Your identity has been verified. You can now invest in projects and access all features.",
        shouldRefresh: false,
      };
    case "REJECTED":
      return {
        icon: "cancel",
        iconBg: "bg-red-100 dark:bg-red-900/30",
        iconColor: "text-red-500",
        heading: "Verification Rejected",
        description:
          "Your identity verification was not approved. Please contact support or try again with valid documents.",
        shouldRefresh: false,
      };
    case "NONE":
      return {
        icon: "info",
        iconBg: "bg-blue-100 dark:bg-blue-900/30",
        iconColor: "text-blue-500",
        heading: "Verification Not Started",
        description:
          "You haven't started identity verification yet. Complete KYC to unlock all features.",
        shouldRefresh: false,
      };
    default:
      return {
        icon: "hourglass_top",
        iconBg: "bg-amber-100 dark:bg-amber-900/30",
        iconColor: "text-amber-500",
        heading: "Verification In Progress",
        description:
          "Your documents are being reviewed. This usually takes a few minutes but may take up to 24 hours.",
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
      <div className="pt-16 pb-24 px-5">
        {/* Status Icon */}
        <div className="flex justify-center mt-12 mb-6">
          <div
            className={`w-24 h-24 rounded-full ${config.iconBg} flex items-center justify-center`}
          >
            <span className={`material-symbols-outlined ${config.iconColor} text-5xl`}>
              {config.icon}
            </span>
          </div>
        </div>

        {/* Status Info */}
        <h2 className="text-xl font-bold text-center mb-2">
          {config.heading}
        </h2>
        <p className="text-text-muted text-sm text-center mb-8">
          {config.description}
        </p>

        {/* Reference ID with copy + auto-refresh */}
        {referenceId !== "N/A" && (
          <KycStatusClient referenceId={referenceId} shouldRefresh={config.shouldRefresh} />
        )}

        {/* Action Buttons */}
        {user.kycStatus === "NONE" ? (
          <Link
            href="/kyc"
            className="block w-full py-3.5 bg-primary text-white text-center font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-glow"
          >
            Start Verification
          </Link>
        ) : (
          <Link
            href="/dashboard"
            className="block w-full py-3.5 bg-gradient-to-r from-primary to-secondary text-white text-center font-bold rounded-xl hover:opacity-90 transition-opacity shadow-glow"
          >
            Back to Dashboard
          </Link>
        )}

        {user.kycStatus === "REJECTED" && (
          <Link
            href="/kyc/verify"
            className="block w-full py-3.5 mt-3 border border-primary text-primary text-center font-bold rounded-xl hover:bg-primary/5 transition-colors"
          >
            Try Again
          </Link>
        )}
      </div>
    </>
  );
}
