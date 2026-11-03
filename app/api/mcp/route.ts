import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { registerTools } from "@/mcp/tools";
import { principalForPat } from "@/lib/pat";

export const maxDuration = 60;

const handler = withMcpAuth(
  createMcpHandler(registerTools, { serverInfo: { name: "the-cabinet", version: "0.1.0" } }),
  async (_req, bearer) => {
    const pid = await principalForPat(bearer);
    return pid ? { token: bearer!, clientId: pid, scopes: ["principal"] } : undefined;
  },
  { required: false },
);

export { handler as GET, handler as POST, handler as DELETE };
