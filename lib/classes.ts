export const CLASSES = {
  recommend: { label: "Recommend", example: "What do you recommend for databases?", looks: "Repos, decision docs, postmortems, chat threads" },
  handle: { label: "Handle", example: "How would you handle a disgruntled employee?", looks: "Similar past situations, notes, what worked" },
  find: { label: "Find", example: "Who could lead podcast ad sales on commission?", looks: "Email, contacts, meeting notes" },
  weigh_in: { label: "Weigh In", example: "Should we bring back jingles as an ad product?", looks: "Past campaigns, results, prior opinions" },
  coordinate: { label: "Coordinate", example: "Which weeks work for a family trip next year?", looks: "Calendar, stated preferences" },
} as const;
export type RfcClass = keyof typeof CLASSES;

export const STATUS_LABEL: Record<string, string> = {
  sent: "Dispatched", accepted: "Accepted", recused: "Recused", drafted: "Drafted, unsigned", signed: "Signed", expired: "Expired",
};
export const BASIS_LABEL = { record: "From the Record", general: "General Counsel" } as const;
export const AUTHORSHIP_LABEL = { own_hand: "In Own Hand", staff_drafted: "Staff-Drafted, Signed" } as const;

export const rfcNumber = (n: number) => `RFC-${String(n).padStart(4, "0")}`;
export const appUrl = () => process.env.APP_URL ?? "http://localhost:3000";
