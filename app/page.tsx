import Link from "next/link";
import { PublicSubmissionForm } from "@/components/PublicSubmissionForm";
import { HelpAndSupport } from "@/components/HelpAndSupport";

export default function HomePage() {
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
          <Link href="/sao-paulo" className="btn-outline">
            Público São Paulo
          </Link>
          <Link href="/lisboa" className="btn-outline">
            Público Lisboa
          </Link>
          <Link href="/organizar" className="btn-outline">
            Área interna
          </Link>
        </div>
      </header>

      <section className="hero hero-public">
        <div className="hero-card">
          <span className="badge">Envio público</span>
          <h2>Envie uma pauta de oração para o VDS 2026.</h2>
          <p>
            Cada envio representa um item individual. Depois, todas as
            contribuições serão analisadas, revisadas e poderão compor os 40
            dias de oração.
          </p>
        </div>
        <div className="side-card compact-side">
          <h3>Como funciona</h3>
          <div className="flow">
            <div className="flow-item">
              <div className="flow-step">1</div>
              <div>
                <strong>Você envia</strong>
                <span>
                  Texto, referência, categoria, tipo de oração e idioma.
                </span>
              </div>
            </div>
            <div className="flow-item">
              <div className="flow-step">2</div>
              <div>
                <strong>A equipe revisa</strong>
                <span>O item é ajustado e avaliado editorialmente.</span>
              </div>
            </div>
            <div className="flow-item">
              <div className="flow-step">3</div>
              <div>
                <strong>Os dias são montados</strong>
                <span>Cada dia recebe 5 itens aprovados.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicSubmissionForm />
    </main>
  );
}
