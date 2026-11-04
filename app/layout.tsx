import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Seal } from "@/components/Seal";
import { supabaseServer } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions";

export const metadata: Metadata = {
  title: { default: "The Cabinet", template: "%s · The Cabinet" },
  description: "Convene a Cabinet of trusted advisors. Put a Request for Counsel to them. Receive signed Opinions drafted by each advisor's own AI from their own record.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  return (
    <html lang="en">
      <body>
        <header className="masthead">
          <div className="bar">
            <Link href="/" className="brand"><Seal size={34} /> The Cabinet</Link>
            <nav>
              {data.user ? (<>
                <Link href="/cabinets">Cabinets</Link>
                <Link href="/account">Account</Link>
                <form action={signOut} style={{ margin: 0 }}><button type="submit" className="secondary" style={{ padding: "0 0.4rem", border: 0, fontFamily: "inherit", fontWeight: 400 }}>Sign out</button></form>
              </>) : (<>
                <Link href="/connect">Secure Line</Link>
                <Link href="/login">Sign in</Link>
              </>)}
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer>
          <div className="bar">
            <span>The Cabinet is not a government service.</span>
            <span>An open-source build of Flintspark Labs · Specification FSL-CAB-001</span>
            <Link href="/privacy">Privacy</Link>
            <Link href="/opt-out">Opt out of Dispatches</Link>
            <a href="https://github.com/Flintspark-Labs/cabinet">Source</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
