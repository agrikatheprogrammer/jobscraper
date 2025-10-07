import { DeployButton } from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { Hero } from "@/components/hero";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ConnectSupabaseSteps } from "@/components/tutorial/connect-supabase-steps";
import { SignUpUserSteps } from "@/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import AuthPanel from "@/components/auth-panel";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  // Server-side session check. If an authenticated session exists, redirect
  // users to the protected area so they don't see the signup/login prompt.
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) redirect("/protected");
  } catch (e) {
    // If anything goes wrong checking the session, fall through and show the
    // public landing page. Do not crash the entire page.
    console.log("Session check failed:", e);
  }
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href={"/"}>JobAI</Link>
            </div>
            <div>
              Find jobs faster and smarter, tailored just for you.
            </div>
          </div>
        </nav>
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
          {/* Minimal auth panel for unauthenticated users */}
          <div className="w-full flex justify-center items-start py-12">
            {/* Client component that toggles between login and signup */}
            {/* @ts-expect-error Async server component importing client component */}
            <AuthPanel />
          </div>
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <a href="mailto:agrika.gupta@sjsu.edu">
            Built by Agrika Gupta
          </a>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
