import type { IcpInput } from "@revon-tinyfish/contracts";

export interface DemoPreset {
  id: string;
  label: string;
  note: string;
  recommended?: boolean;
  input: IcpInput;
}

export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: "london-digital-marketing",
    label: "London digital agencies",
    note: "Recommended live demo path",
    recommended: true,
    input: {
      targetMarket: "Digital marketing",
      location: "London",
      companySize: "11-50",
      keywords: "B2B, SaaS, growth",
      decisionMakerRole: "Founder",
      maxResults: 5,
    },
  },
  {
    id: "berlin-web-development",
    label: "Berlin web dev shops",
    note: "Good fallback live preset",
    input: {
      targetMarket: "Web development",
      location: "Berlin",
      companySize: "11-50",
      keywords: "B2B, product, SaaS",
      decisionMakerRole: "Managing Director",
      maxResults: 4,
    },
  },
  {
    id: "amsterdam-seo",
    label: "Amsterdam SEO agencies",
    note: "Smaller, focused prospect list",
    input: {
      targetMarket: "SEO",
      location: "Amsterdam",
      companySize: "11-50",
      keywords: "lead generation, B2B",
      decisionMakerRole: "Founder",
      maxResults: 4,
    },
  },
];

export const DEFAULT_DEMO_INPUT: IcpInput = DEMO_PRESETS[0]?.input ?? {
  targetMarket: "Digital marketing",
  location: "London",
  companySize: "11-50",
  keywords: "B2B, SaaS, growth",
  decisionMakerRole: "Founder",
  maxResults: 5,
};
