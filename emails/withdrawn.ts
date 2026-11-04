import { rfcNumber } from "@/lib/classes";
export const withdrawnEmail = (secretary: string, principal: string, rfc_number: number) =>
  `Dear ${secretary},\n\n${principal} has withdrawn ${rfcNumber(rfc_number)} and dissolved the Cabinet it belonged to. Your Dispatch link no longer works and anything you drafted or signed on it has been deleted. Nothing further is needed.\n\n—\nThe Cabinet is not a government service.`;
