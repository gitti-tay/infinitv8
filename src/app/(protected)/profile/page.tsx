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

const menuSections = [
  {
    icon: "person",
    label: "Profile",
    description: "Personal info & preferences",
    href: "/profile",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: "security",
    label: "Security",
    description: "Coming soon",
    href: "",
    color: "from-emerald-500 to-emerald-600",
  },
  {
    icon: "notifications",
    label: "Notifications",
    description: "Alerts & push settings",
    href: "/notifications",
    color: "from-amber-500 to-amber-600",
  },
  {
    icon: "credit_card",
    label: "Payments",
    description: "Payment methods",
    href: "/wallet",
    color: "from-violet-500 to-violet-600",
  },
  {
    icon: "description",
    label: "Documents",
    description: "Coming soon",
    href: "",
    color: "from-pink-500 to-pink-600",
  },
  {
    icon: "tune",
    label: "Preferences",
    description: "Coming soon",
    href: "",
    color: "from-cyan-500 to-cyan-600",
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
      <Header title="Settings" showBack={false} />
      <div className="pt-16 pb-24 px-5 animate-fadeIn">
        {/* Profile Header */}
        <div className="flex flex-col items-center mt-6 mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mb-3 shadow-glow">
            <span className="text-white text-2xl font-bold">{initial}</span>
          </div>
          <h2 className="font-bold text-lg">{user.name}</h2>
          <p className="text-text-muted text-sm">{user.email}</p>
          <div className="mt-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${kycBadge.bg} ${kycBadge.text}`}
            >
              <span className="material-symbols-outlined text-sm">
                {kycBadge.icon}
              </span>
              {kycBadge.label}
            </span>
          </div>
        </div>

        {/* KYC Status Card */}
        {user.kycStatus !== "APPROVED" && (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-5 mb-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs mb-1">KYC Status</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`material-symbols-outlined text-lg ${
                      user.kycStatus === "PENDING"
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
              <Link
                href={user.kycStatus === "PENDING" ? "/kyc/status" : "/kyc"}
                className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-dark transition-colors"
              >
                {user.kycStatus === "PENDING" ? "Check Status" : "Verify Now"}
              </Link>
            </div>
          </div>
        )}

        {/* DEX Wallet */}
        <WalletConnectButton />

        {/* Menu Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6 mt-6">
          {menuSections.map((item) => {
            const content = (
              <>
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3`}
                >
                  <span className="material-symbols-outlined text-white text-lg">
                    {item.icon}
                  </span>
                </div>
                <p className="font-bold text-sm">{item.label}</p>
                <p className="text-[10px] text-text-muted mt-0.5">
                  {item.description}
                </p>
              </>
            );

            if (!item.href) {
              return (
                <div
                  key={item.label}
                  className="bg-card-light dark:bg-card-dark rounded-2xl p-4 border border-gray-100 dark:border-gray-800 opacity-60"
                >
                  {content}
                </div>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className="bg-card-light dark:bg-card-dark rounded-2xl p-4 border border-gray-100 dark:border-gray-800 hover:shadow-soft transition-all"
              >
                {content}
              </Link>
            );
          })}
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
            className="w-full py-3.5 border border-red-200 dark:border-red-900/50 text-red-500 text-center font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
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
