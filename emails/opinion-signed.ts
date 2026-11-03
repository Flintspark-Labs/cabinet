import { rfcNumber } from "@/lib/classes";
export const opinionSignedEmail = (secretary: string, rfc_number: number, link: string) =>
  `${secretary} has signed an Opinion on ${rfcNumber(rfc_number)}.\n\nRead it in the Briefing Room:\n${link}\n\n—\nThe Cabinet is not a government service.`;
