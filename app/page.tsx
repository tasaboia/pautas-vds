import Link from "next/link";
import { PublicSubmissionForm } from "@/components/PublicSubmissionForm";

export default function HomePage() {
  return (
    <main>
      <div className="container">
        <header className="header">
          <div className="brand">
            <div>
              <div className="badge">Plataforma editorial de pautas</div>
              <h1 className="hero-title" style={{ marginTop: 14 }}>
                Central de Pautas de Oração
              </h1>
              <p className="small hero-copy">
                Um fluxo simples, mas com aparência profissional: cadastro
                público, curadoria interna, planejamento por dia e saída pronta
                para arte.
              </p>
            </div>
            <Link href="/organizar" className="btn secondary">
              Entrar na área de organização
            </Link>
          </div>
        </header>

        <PublicSubmissionForm />

        <footer>
          Next.js + Auth.js + Prisma + PostgreSQL (Neon). Estrutura pronta para
          crescer sem perder simplicidade.
        </footer>
      </div>
    </main>
  );
}
