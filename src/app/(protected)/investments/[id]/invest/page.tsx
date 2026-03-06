"use client";

import { Header } from "@/components/ui/header";
import { InvestmentWizard } from "./components/investment-wizard";

export default function InvestPage() {
  return (
    <>
      <Header title="Invest" />
      <InvestmentWizard />
    </>
  );
}
