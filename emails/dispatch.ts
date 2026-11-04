import { rfcNumber, appUrl, CLASSES, type RfcClass } from "@/lib/classes";

const footer = (email: string) =>
  `\n\n—\nThe Cabinet is not a government service. ${appUrl()}\nStop all future Dispatches to this address: ${appUrl()}/opt-out?email=${encodeURIComponent(email)}\nReport abuse: reply to this message.`;

export function dispatchEmail(p: { first: boolean; secretary: string; principal: string; rfc_number: number; cls: RfcClass; question: string; return_by: string; link: string; email: string }) {
  const intro = p.first
    ? `${p.principal} has asked for your counsel through The Cabinet.\n\nThe Cabinet is a site where people put a question to a few people they trust. You open a link, read the question, and either answer or decline. If you answer, you can paste the request into your own AI assistant so it drafts from your own notes and history; you review, edit and sign before anything is sent. Nothing is sent without your signature, and nothing from your side is stored except the answer you sign. It is encrypted and deleted 30 days after the question closes.\n\n`
    : `${p.principal} has put a Request for Counsel to you.\n\n`;
  return `Dear ${p.secretary},\n\n${intro}${rfcNumber(p.rfc_number)} · ${CLASSES[p.cls].label}\n"${p.question}"\n\nReturn by ${new Date(p.return_by).toUTCString()}.\n\nAccept or recuse here:\n${p.link}\n\nThis link is yours alone. It expires at the return-by date.${footer(p.email)}`;
}

export function reminderEmail(p: { secretary: string; rfc_number: number; return_by: string; link: string; email: string }) {
  return `Dear ${p.secretary},\n\n${rfcNumber(p.rfc_number)} is still open and returns in about 48 hours (${new Date(p.return_by).toUTCString()}).\n\n${p.link}${footer(p.email)}`;
}
