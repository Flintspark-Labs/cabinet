import { rfcNumber } from "@/lib/classes";
export const briefReadyEmail = (rfc_number: number, link: string) =>
  `The Brief for ${rfcNumber(rfc_number)} is compiled.\n\n${link}\n\n—\nThe Cabinet is not a government service.`;
