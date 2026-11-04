import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  redirects: async () => [{ source: "/contextnext", destination: "/contextnest", permanent: true }],
};
export default nextConfig;
