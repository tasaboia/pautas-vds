import { auth, signIn, signOut } from "@/auth";
import { OrganizerDashboard } from "@/components/OrganizerDashboard";

export default async function OrganizerPage() {
  const session = await auth();

  return (
    <main>
      <div className="container">
        <header className="header">
          <div className="brand">
            <div>
              <div className="badge">Painel interno</div>
              <h1 style={{ marginTop: 14 }}>Organização das pautas</h1>
              <p className="small">Login Google para revisão editorial, planejamento por dia e preparação para arte.</p>
            </div>
            {session?.user ? (
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button className="btn secondary" type="submit">Sair</button>
              </form>
            ) : null}
          </div>
        </header>

        {!session?.user ? (
          <div className="card login-card">
            <span className="badge badge-soft">Acesso restrito</span>
            <h2 style={{ marginTop: 16 }}>Entrar com Google</h2>
            <p className="small">
              Use uma conta autorizada em <code>AUTHORIZED_ORGANIZER_EMAILS</code>. Se essa variável ficar vazia,
              qualquer conta Google poderá entrar.
            </p>
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/organizar" });
              }}
            >
              <button className="btn" type="submit">Entrar com Google</button>
            </form>
          </div>
        ) : (
          <>
            <div className="card session-card" style={{ marginBottom: 18 }}>
              <p className="small">Conectada como <strong>{session.user.email}</strong></p>
            </div>
            <OrganizerDashboard />
          </>
        )}
      </div>
    </main>
  );
}
