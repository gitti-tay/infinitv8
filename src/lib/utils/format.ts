export function formatCurrency(
  amount: number,
  options?: { maximumFractionDigits?: number; minimumFractionDigits?: number }
): string {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: options?.minimumFractionDigits ?? 2,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getCategoryIcon(category: string): string {
  switch (category) {
    case "HEALTHCARE":
      return "local_hospital";
    case "AGRICULTURE":
      return "eco";
    case "REAL_ESTATE":
      return "apartment";
    case "COMMODITIES":
      return "inventory_2";
    default:
      return "category";
  }
}

export function getCategoryLabel(category: string): string {
  switch (category) {
    case "REAL_ESTATE":
      return "Real Estate";
    case "AGRICULTURE":
      return "Agriculture";
    case "HEALTHCARE":
      return "Healthcare";
    case "COMMODITIES":
      return "Commodities";
    default:
      return category;
  }
}

export function getRiskColor(riskLevel: string): string {
  switch (riskLevel) {
    case "LOW":
      return "text-accent";
    case "MEDIUM":
      return "text-amber-600";
    case "HIGH":
      return "text-red-500";
    default:
      return "text-text-muted";
  }
}

export function getRiskBadgeColor(riskLevel: string): string {
  switch (riskLevel) {
    case "LOW":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "MEDIUM":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    case "HIGH":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export function getRiskLabel(riskLevel: string): string {
  switch (riskLevel) {
    case "LOW":
      return "Low Risk";
    case "MEDIUM":
      return "Medium Risk";
    case "HIGH":
      return "High Risk";
    default:
      return riskLevel;
  }
}

export function getRiskLabelShort(riskLevel: string): string {
  switch (riskLevel) {
    case "LOW":
      return "Low";
    case "MEDIUM":
      return "Med";
    case "HIGH":
      return "High";
    default:
      return riskLevel;
  }
}
