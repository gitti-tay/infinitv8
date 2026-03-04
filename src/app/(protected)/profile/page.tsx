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
        bg: "bg-accent/10",
        text: "text-accent",
        icon: "verified",
      };
    case "PENDING":
      return {
        label: "Pending",
        bg: "bg-amber/10",
        text: "text-amber",
        icon: "hourglass_top",
      };
    case "REJECTED":
      return {
        label: "Rejected",
        bg: "bg-destructive/10",
        text: "text-destructive",
        icon: "cancel",
      };
    default:
      return {
        label: "Not Verified",
        bg: "bg-background-tertiary",
        text: "text-text-muted",
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
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: "security",
    label: "Security",
    description: "Coming soon",
    href: "",
    iconBg: "bg-accent/10",
    iconColor: "text-accent",
  },
  {
    icon: "notifications",
    label: "Notifications",
    description: "Alerts & push settings",
    href: "/notifications",
    iconBg: "bg-amber/10",
    iconColor: "text-amber",
  },
  {
    icon: "credit_card",
    label: "Payments",
    description: "Payment methods",
    href: "/wallet",
    iconBg: "bg-purple/10",
    iconColor: "text-purple",
  },
  {
    icon: "description",
    label: "Documents",
    description: "Coming soon",
    href: "",
    iconBg: "bg-destructive/10",
    iconColor: "text-destructive",
  },
  {
    icon: "tune",
    label: "Preferences",
    description: "Coming soon",
    href: "",
    iconBg: "bg-cyan/10",
    iconColor: "text-cyan",
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
      <div className="pt-16 pb-24 md:pb-8 px-5 animate-fadeIn">
        {/* User Info Card */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-soft mt-4">
          <div className="flex flex-col items-center">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-purple flex items-center justify-center mb-3 shadow-glow">
              <span className="text-white text-2xl font-bold">{initial}</span>
            </div>
            {/* Name & Email */}
            <h2 className="font-bold text-lg text-text-primary">{user.name}</h2>
            <p className="text-text-muted text-sm">{user.email}</p>
            {/* KYC Badge */}
            <div className="mt-3">
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
        </div>

        {/* KYC Status Card */}
        {user.kycStatus !== "APPROVED" && (
          <div className="bg-card border border-border rounded-xl p-5 mt-4 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-xs mb-1">KYC Status</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`material-symbols-outlined text-lg ${
                      user.kycStatus === "PENDING"
                        ? "text-amber"
                        : user.kycStatus === "REJECTED"
                          ? "text-destructive"
                          : "text-text-muted"
                    }`}
                  >
                    {kycBadge.icon}
                  </span>
                  <span className="text-text-primary font-bold text-sm">
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
        <div className="mt-4">
          <WalletConnectButton />
        </div>

        {/* Settings Menu Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6 mb-6">
          {menuSections.map((item) => {
            const content = (
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${item.iconBg} flex items-center justify-center`}
                  >
                    <span
                      className={`material-symbols-outlined ${item.iconColor} text-lg`}
                    >
                      {item.icon}
                    </span>
                  </div>
                  {item.href && (
                    <span className="material-symbols-outlined text-text-muted text-lg">
                      chevron_right
                    </span>
                  )}
                </div>
                <p className="font-bold text-sm text-text-primary">{item.label}</p>
                <p className="text-[10px] text-text-muted mt-0.5">
                  {item.description}
                </p>
              </div>
            );

            if (!item.href) {
              return (
                <div
                  key={item.label}
                  className="bg-card border border-border rounded-xl p-4 opacity-60 shadow-soft"
                >
                  {content}
                </div>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className="bg-card border border-border rounded-xl p-4 hover:shadow-medium hover:border-border-light transition-all shadow-soft"
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
            className="w-full py-3.5 border border-destructive/20 text-destructive text-center font-bold rounded-xl hover:bg-destructive/5 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Sign Out
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
