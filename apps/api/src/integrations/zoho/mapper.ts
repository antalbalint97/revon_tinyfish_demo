import type { LeadRecord } from "@revon-tinyfish/contracts";

export interface ZohoLead {
  Last_Name: string;
  First_Name?: string;
  Company: string;
  Email?: string;
  Title?: string;
  Website?: string;
  Lead_Source?: string;
  Description?: string;
  [key: string]: unknown;
}

function splitName(fullName: string): { First_Name?: string; Last_Name: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { Last_Name: parts[0] };
  }
  const last = parts.pop()!;
  return { First_Name: parts.join(" "), Last_Name: last };
}

export function mapLeadToZohoRecords(lead: LeadRecord): ZohoLead[] {
  const sharedFields = {
    Company: lead.companyName || lead.companyDomain || "Unknown Company",
    Website: lead.websiteUrl || undefined,
    Lead_Source: "Scoutbound",
    Description: [
      lead.summary,
      lead.score.reasons.length > 0 ? `Qualification reasons: ${lead.score.reasons.join(", ")}` : null,
    ]
      .filter(Boolean)
      .join("\n\n") || undefined,
  };

  if (lead.contacts.length === 0) {
    return [
      {
        Last_Name: lead.companyName || lead.companyDomain || "Unknown",
        ...sharedFields,
      },
    ];
  }

  return lead.contacts.map((contact) => {
    const nameParts = contact.name ? splitName(contact.name) : { Last_Name: lead.companyName || "Unknown" };

    return {
      ...nameParts,
      ...sharedFields,
      ...(contact.email ? { Email: contact.email } : {}),
      ...(contact.role ? { Title: contact.role } : {}),
    };
  });
}
