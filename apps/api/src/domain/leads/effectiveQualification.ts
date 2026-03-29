import type { LeadRecord } from "@revon-tinyfish/contracts";

export function getEffectiveQualificationState(lead: LeadRecord) {
  return (
    lead.operatorQualificationState ??
    lead.score?.qualificationState ??
    "review"
  );
}
