"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { StepIndicator } from "./step-indicator";
import { TermsStep } from "./terms-step";
import { WalletCheckStep } from "./wallet-check-step";
import { AmountStep } from "./amount-step";

interface Project {
  id: string;
  name: string;
  ticker: string;
  apy: number;
  term: number;
  riskLevel: string;
  minInvestment: number;
  payout: string;
  category: string;
  location: string;
  status: string;
}

type WizardStep = "terms" | "wallet" | "amount";

const STEPS: WizardStep[] = ["terms", "wallet", "amount"];

export function InvestmentWizard() {
  const params = useParams<{ id: string }>();
  const [currentStep, setCurrentStep] = useState<WizardStep>("terms");
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProject() {
      try {
        const res = await fetch(`/api/projects/${params.id}`);
        if (!res.ok) throw new Error("Failed to load project");
        const data = await res.json();
        setProject(data);
      } catch {
        setError("Failed to load project details");
      } finally {
        setLoading(false);
      }
    }
    fetchProject();
  }, [params.id]);

  function goNext() {
    const idx = STEPS.indexOf(currentStep);
    if (idx < STEPS.length - 1) {
      setCurrentStep(STEPS[idx + 1]);
      window.scrollTo(0, 0);
    }
  }

  function goBack() {
    const idx = STEPS.indexOf(currentStep);
    if (idx > 0) {
      setCurrentStep(STEPS[idx - 1]);
      window.scrollTo(0, 0);
    }
  }

  if (loading) {
    return (
      <div className="pt-16 pb-24 md:pb-8 px-5 flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-text-muted">Loading...</div>
      </div>
    );
  }

  if (!project || error) {
    return (
      <div className="pt-16 pb-24 md:pb-8 px-5 flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error || "Project not found"}</p>
      </div>
    );
  }

  return (
    <div className="pt-16 pb-28 px-5 animate-fadeIn">
      <StepIndicator currentStep={currentStep} />

      {currentStep === "terms" && (
        <TermsStep onContinue={goNext} />
      )}
      {currentStep === "wallet" && (
        <WalletCheckStep onContinue={goNext} onBack={goBack} />
      )}
      {currentStep === "amount" && (
        <AmountStep project={project} onBack={goBack} />
      )}
    </div>
  );
}
