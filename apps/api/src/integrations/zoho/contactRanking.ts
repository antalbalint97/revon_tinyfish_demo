import type { LeadContact } from "@revon-tinyfish/contracts";

function normalize(value: string): string {
  return value.toLowerCase().trim();
}

function isGenericRole(role: string): boolean {
  return /^(company inbox|contact|general enquiry|general inquiry|team|office|sales|support|info|hello|mail|contact us)$/i.test(
    normalize(role),
  );
}

function isDecisionMakerTitle(role: string): boolean {
  return /founder|ceo|chief|director|vp|head|partner|owner|president|managing director|lead/i.test(role);
}

export function rankContactsForPush(contacts: LeadContact[]): LeadContact[] {
  return [...contacts].sort((left, right) => {
    const score = (contact: LeadContact): number => {
      let total = 0;
      if (contact.email) total += 45;
      if (contact.isDecisionMaker) total += 30;
      if (isDecisionMakerTitle(contact.role)) total += 18;
      if (contact.linkedinUrl) total += 12;
      if (contact.name.trim().split(/\s+/).length >= 2) total += 5;
      if (contact.role.trim().length > 0 && !isGenericRole(contact.role)) total += 8;
      if (isGenericRole(contact.role)) total -= 18;
      return total;
    };

    const rightScore = score(right);
    const leftScore = score(left);

    if (rightScore !== leftScore) {
      return rightScore - leftScore;
    }

    if (right.isDecisionMaker !== left.isDecisionMaker) {
      return right.isDecisionMaker ? 1 : -1;
    }

    if (Boolean(right.email) !== Boolean(left.email)) {
      return right.email ? 1 : -1;
    }

    return left.name.localeCompare(right.name);
  });
}

