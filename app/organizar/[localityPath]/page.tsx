import { notFound } from "next/navigation";
import { auth, signIn, signOut } from "@/auth";
import { OrganizerDashboard } from "@/components/OrganizerDashboard";
import { localityCodeFromPath } from "@/lib/localities";
import { HelpAndSupport } from "@/components/HelpAndSupport";

type Params = { params: Promise<{ localityPath: string }> };

export default async function LocalizedOrganizerPage({ params }: Params) {
  const { localityPath } = await params;
  const forcedLocality = localityCodeFromPath(localityPath);
  if (!forcedLocality) notFound();

  const session = await auth();

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" />
          <div>
            <h1>Central de Pautas de Oração</h1>
            <p>Área interna de revisão, composição do dia e exportação</p>
          </div>
        </div>
        <div className="top-actions">
          <HelpAndSupport scope="organizer" />
          {session?.user ? (
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: `/${localityPath}` });
              }}
            >
              <button className="btn-outline" type="submit">
                Sair
              </button>
            </form>
          ) : null}
        </div>
      </header>

      {!session?.user ? (
        <section className="login-card">
          <span className="badge">Acesso restrito</span>
          <h2>Entrar com Google</h2>
          <p>
            Somente e-mails autorizados podem entrar na área de organização.
          </p>
          <form
            action={async () => {
              "use server";
              await signIn("google", {
                redirectTo: `/organizar/${localityPath}`,
              });
            }}
          >
            <button className="btn" type="submit">
              Entrar com Google
            </button>
          </form>
        </section>
      ) : (
        <OrganizerDashboard
          email={session.user.email || ""}
          forcedLocality={forcedLocality}
        />
      )}
    </main>
  );
}
