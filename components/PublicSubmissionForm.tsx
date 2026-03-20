"use client";

import { useState } from "react";
import { categorias, idiomas, tiposOracao } from "@/lib/options";

type FormState = {
  tipoOracao: string;
  pauta: string;
  referencia: string;
  idioma: string;
  categoria: string;
  observacaoPublica: string;
};

const initialState: FormState = {
  tipoOracao: tiposOracao[0],
  pauta: "",
  referencia: "",
  idioma: idiomas[0],
  categoria: categorias[0],
  observacaoPublica: "",
};

export function PublicSubmissionForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const response = await fetch("/api/pautas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error || "Não foi possível enviar a pauta.");
      return;
    }

    setForm(initialState);
    setMessage("Pauta enviada com sucesso. Obrigado por contribuir 💜");
  }

  return (
    <section className="submission-wrap">
      <div className="card form-intro">
        <span className="badge badge-soft">Área pública</span>
        <h2 style={{ marginTop: 16 }}>Envie uma pauta com rapidez e clareza</h2>
        <p className="small">
          Este formulário foi pensado para ficar leve e objetivo. A equipe de organização fará a revisão,
          o ajuste editorial e a distribuição por dia depois do envio.
        </p>
        <div className="list compact-list">
          <div className="mini-point"><strong>Objetiva</strong><span className="small">1 a 2 frases no máximo.</span></div>
          <div className="mini-point"><strong>Bíblica</strong><span className="small">Inclua a referência já escrita.</span></div>
          <div className="mini-point"><strong>Direcionada</strong><span className="small">Escreva como pauta, não como oração longa.</span></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card form-card-pro">
        <div className="panel-head">
          <div>
            <h2>Cadastro de pauta</h2>
            <p className="small">Preencha os campos abaixo para enviar sua contribuição.</p>
          </div>
        </div>

        <div className="grid">
          <div className="field">
            <label htmlFor="categoria">Categoria</label>
            <select id="categoria" value={form.categoria} onChange={(e) => update("categoria", e.target.value)}>
              {categorias.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="tipoOracao">Tipo de oração</label>
            <select id="tipoOracao" value={form.tipoOracao} onChange={(e) => update("tipoOracao", e.target.value)}>
              {tiposOracao.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid">
          <div className="field">
            <label htmlFor="idioma">Idioma</label>
            <select id="idioma" value={form.idioma} onChange={(e) => update("idioma", e.target.value)}>
              {idiomas.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="referencia">Referência bíblica</label>
            <input
              id="referencia"
              value={form.referencia}
              onChange={(e) => update("referencia", e.target.value)}
              required
              placeholder="Ex.: Isaías 6:8; Mateus 28:19-20"
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="pauta">Pauta de oração</label>
          <textarea
            id="pauta"
            value={form.pauta}
            onChange={(e) => update("pauta", e.target.value)}
            required
            placeholder="Ex.: Ore para que haja arrependimento genuíno e uma volta à essência do Evangelho."
          />
        </div>

        <div className="field">
          <label htmlFor="observacaoPublica">Observação opcional</label>
          <input
            id="observacaoPublica"
            value={form.observacaoPublica}
            onChange={(e) => update("observacaoPublica", e.target.value)}
            placeholder="Ex.: contexto, detalhe ou direcionamento adicional"
          />
        </div>

        <div className="row-actions">
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Cadastrar pauta"}
          </button>
          {message ? <span className="small">{message}</span> : null}
        </div>
      </form>
    </section>
  );
}
