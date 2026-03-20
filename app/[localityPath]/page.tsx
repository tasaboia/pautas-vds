import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicSubmissionForm } from "@/components/PublicSubmissionForm";
import { localityCodeFromPath } from "@/lib/localities";
import { HelpAndSupport } from "@/components/HelpAndSupport";

type Params = { params: Promise<{ localityPath: string }> };

export default async function LocalizedHomePage({ params }: Params) {
  const { localityPath } = await params;
  const forcedLocality = localityCodeFromPath(localityPath);

  if (!forcedLocality) notFound();

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" />
          <div>
            <h1>Central de Pautas de Oração</h1>
            <p>Coleta pública, curadoria editorial e composição dos 40 dias</p>
          </div>
        </div>
        <div className="top-actions">
          <HelpAndSupport scope="public" />
          <Link href={`/organizar/${localityPath}`} className="btn-outline">
            Área interna
          </Link>
        </div>
      </header>

      <section className="hero hero-public">
        <div className="hero-card">
          <span className="badge">Envio público</span>
          <h2>Pautas de oração para o VDS 2026.</h2>
          <p>
            Cada envio representa um item individual. Depois, todas as
            contribuições serão analisadas, revisadas e poderão compor os 40
            dias de oração.
          </p>
        </div>
      </section>

      <PublicSubmissionForm forcedLocality={forcedLocality} />
    </main>
  );
}
