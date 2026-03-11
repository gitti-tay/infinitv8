"use client";

import { Suspense } from "react";
import { Header } from "@/components/ui/header";
import { InvestmentWizard } from "./components/investment-wizard";

export default function InvestPage() {
  return (
    <>
      <Header title="Invest" />
      <Suspense fallback={
        <div className="pt-16 pb-24 px-5 flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-text-muted">Loading...</div>
        </div>
      }>
        <InvestmentWizard />
      </Suspense>
    </>
  );
}
