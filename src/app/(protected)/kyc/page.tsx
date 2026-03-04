import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/ui/header";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function KycStartPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  if (user.kycStatus === "APPROVED") {
    redirect("/dashboard");
  }

  if (user.kycStatus === "PENDING") {
    redirect("/kyc/status");
  }

  const steps = [
    {
      icon: "person",
      title: "Personal Information",
      description: "Provide your name, date of birth, and address",
    },
    {
      icon: "badge",
      title: "ID Document Upload",
      description: "Upload a government-issued photo ID",
    },
    {
      icon: "face",
      title: "Face Verification",
      description: "Take a quick selfie for identity matching",
    },
  ];

  return (
    <>
      <Header title="Identity Verification" />
      <div className="pt-16 pb-24 px-5 animate-fadeIn">
        {/* Step Badge */}
        <div className="flex justify-center mt-4 mb-2">
          <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
            Step 1 of 3
          </span>
        </div>

        {/* Verification Icon */}
        <div className="flex justify-center mt-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-4xl">
              verified_user
            </span>
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-xl font-bold text-center mb-2">
          Verify Your Identity
        </h2>
        <p className="text-text-muted text-sm text-center mb-8">
          Complete KYC verification to start investing. This process takes about
          5 minutes.
        </p>

        {/* Steps */}
        <div className="space-y-4 mb-8">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="flex items-start gap-4 bg-card-light dark:bg-card-dark rounded-2xl p-4 border border-gray-100 dark:border-gray-800"
            >
              <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-lg">
                  {step.icon}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold text-primary">
                    STEP {index + 1}
                  </span>
                </div>
                <h3 className="font-bold text-sm">{step.title}</h3>
                <p className="text-text-muted text-xs mt-0.5">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Security Notice */}
        <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mb-8">
          <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-lg">
            lock
          </span>
          <p className="text-xs text-green-700 dark:text-green-300">
            Your data is encrypted and securely processed by our verification
            partner. We never store your documents on our servers.
          </p>
        </div>

        {/* Start Button */}
        <Link
          href="/kyc/verify"
          className="block w-full py-3.5 bg-primary text-white text-center font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-glow"
        >
          Start Verification
        </Link>
      </div>
    </>
  );
}
