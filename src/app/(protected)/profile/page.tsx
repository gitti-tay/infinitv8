import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/ui/header";
import { WalletConnectButton } from "@/components/wallet/connect-button";
import Link from "next/link";
import { redirect } from "next/navigation";

function getKycStatusBadge(status: string) {
  switch (status) {
    case "APPROVED":
      return {
        label: "Verified",
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-600 dark:text-green-400",
        icon: "verified",
      };
    case "PENDING":
      return {
        label: "Pending",
        bg: "bg-amber-100 dark:bg-amber-900/30",
        text: "text-amber-600 dark:text-amber-400",
        icon: "hourglass_top",
      };
    case "REJECTED":
      return {
        label: "Rejected",
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-600 dark:text-red-400",
        icon: "cancel",
      };
    default:
      return {
        label: "Not Verified",
        bg: "bg-gray-100 dark:bg-gray-800",
        text: "text-gray-500 dark:text-gray-400",
        icon: "shield",
      };
  }
}

const settingsItems = [
  {
    icon: "person",
    label: "Personal Information",
    href: "/profile",
  },
  {
    icon: "security",
    label: "Security & 2FA",
    href: "/profile",
  },
  {
    icon: "notifications",
    label: "Notification Settings",
    href: "/notifications",
  },
];

export default async function ProfilePage() {
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

  const kycBadge = getKycStatusBadge(user.kycStatus);
  const initial = user.name?.charAt(0).toUpperCase() || "U";

  return (
    <>
      <Header title="Profile" showBack={false} />
      <div className="pt-16 pb-24 px-5">
        {/* Profile Header */}
        <div className="flex flex-col items-center mt-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-3">
            <span className="text-white text-2xl font-bold">{initial}</span>
          </div>
          <h2 className="font-bold text-lg">{user.name}</h2>
          <p className="text-text-muted text-sm">{user.email}</p>
        </div>

        {/* KYC Status Card */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-5 mb-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs mb-1">KYC Status</p>
              <div className="flex items-center gap-2">
                <span
                  className={`material-icons text-lg ${
                    user.kycStatus === "APPROVED"
                      ? "text-green-400"
                      : user.kycStatus === "PENDING"
                        ? "text-amber-400"
                        : user.kycStatus === "REJECTED"
                          ? "text-red-400"
                          : "text-gray-400"
                  }`}
                >
                  {kycBadge.icon}
                </span>
                <span className="text-white font-bold text-sm">
                  {kycBadge.label}
                </span>
              </div>
            </div>
            {user.kycStatus === "APPROVED" ? (
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <span className="material-icons text-green-400 text-xl">
                  verified
                </span>
              </div>
            ) : (
              <Link
                href={
                  user.kycStatus === "PENDING" ? "/kyc/status" : "/kyc"
                }
                className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity"
              >
                {user.kycStatus === "PENDING"
                  ? "Check Status"
                  : "Verify Now"}
              </Link>
            )}
          </div>
        </div>

        {/* DEX Wallet */}
        <WalletConnectButton />

        {/* Settings List */}
        <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-6">
          {settingsItems.map((item, index) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                index < settingsItems.length - 1
                  ? "border-b border-gray-100 dark:border-gray-800"
                  : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                  <span className="material-icons text-primary text-lg">
                    {item.icon}
                  </span>
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <span className="material-icons text-text-muted text-lg">
                chevron_right
              </span>
            </Link>
          ))}
        </div>

        {/* Log Out Button */}
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/auth/signin" });
          }}
        >
          <button
            type="submit"
            className="w-full py-3.5 border border-red-200 dark:border-red-900/50 text-red-500 text-center font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Log Out
          </button>
        </form>

        {/* App Version */}
        <p className="text-text-muted text-[10px] text-center mt-6">
          INFINITV8 v1.0.0
        </p>
      </div>
    </>
  );
}
