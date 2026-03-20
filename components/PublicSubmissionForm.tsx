"use client";

<<<<<<< HEAD
import { useEffect, useState } from "react";
import { categorias, idiomas, tiposOracao } from "@/lib/options";
import {
  DEFAULT_LOCALITY,
  LOCALITIES,
  inferLocalityFromBrowser,
  type LocalityCode,
} from "@/lib/localities";

type FormState = {
  locality: LocalityCode;
  textoOriginal: string;
  referenciaBiblica: string;
  categoria: string;
  tipoOracao: string;
  idioma: string;
=======
import { useState } from "react";
import { categorias, idiomas, tiposOracao } from "@/lib/options";

type FormState = {
  tipoOracao: string;
  pauta: string;
  referencia: string;
  idioma: string;
  categoria: string;
>>>>>>> 2ea456331d0280f0f4436421684651d159c2ff2a
  observacaoPublica: string;
};

const initialState: FormState = {
<<<<<<< HEAD
  locality: DEFAULT_LOCALITY,
  textoOriginal: "",
  referenciaBiblica: "",
  categoria: categorias[0],
  tipoOracao: tiposOracao[0],
  idioma: idiomas[0],
  observacaoPublica: "",
};

type PublicSubmissionFormProps = {
  forcedLocality?: LocalityCode;
};

export function PublicSubmissionForm({
  forcedLocality,
}: PublicSubmissionFormProps) {
  const [form, setForm] = useState<FormState>(initialState);
  const [localityTouched, setLocalityTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!forcedLocality) return;
    setForm((prev) => ({ ...prev, locality: forcedLocality }));
  }, [forcedLocality]);

  useEffect(() => {
    if (forcedLocality) return;
    if (localityTouched) return;

    const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const browserLanguage =
      typeof navigator !== "undefined" ? navigator.language : undefined;
    const inferred = inferLocalityFromBrowser(browserTimeZone, browserLanguage);

    setForm((prev) => {
      if (prev.locality !== DEFAULT_LOCALITY) return prev;
      return { ...prev, locality: inferred };
    });
  }, [forcedLocality, localityTouched]);
=======
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
>>>>>>> 2ea456331d0280f0f4436421684651d159c2ff2a

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
<<<<<<< HEAD
    setError(null);

    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Não foi possível enviar o item.");
        return;
      }
      setForm(initialState);
      setMessage("Item enviado com sucesso.");
    } catch {
      setError("Erro ao enviar o item.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="public-form-shell">
      <form onSubmit={handleSubmit} className="public-form-card">
        <div className="section-head">
          <div>
            <span className="badge">Novo item</span>
            <h3>Envie sua pauta</h3>
            <p>Inclua o texto da oração e a referência bíblica.</p>
          </div>
        </div>

        <div className="form-grid-2">
          <div className="field">
            <label>Localidade</label>
            <select
              value={form.locality}
              disabled={Boolean(forcedLocality)}
              onChange={(e) => {
                setLocalityTouched(true);
                update("locality", e.target.value as LocalityCode);
              }}
            >
              {LOCALITIES.map((locality) => (
                <option key={locality.code} value={locality.code}>
                  {locality.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Categoria</label>
            <select
              value={form.categoria}
              onChange={(e) => update("categoria", e.target.value)}
            >
              {categorias.map((item) => (
                <option key={item}>{item}</option>
=======

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
>>>>>>> 2ea456331d0280f0f4436421684651d159c2ff2a
              ))}
            </select>
          </div>
          <div className="field">
<<<<<<< HEAD
            <label>Tipo de oração</label>
            <select
              value={form.tipoOracao}
              onChange={(e) => update("tipoOracao", e.target.value)}
            >
              {tiposOracao.map((item) => (
                <option key={item}>{item}</option>
=======
            <label htmlFor="tipoOracao">Tipo de oração</label>
            <select id="tipoOracao" value={form.tipoOracao} onChange={(e) => update("tipoOracao", e.target.value)}>
              {tiposOracao.map((item) => (
                <option key={item} value={item}>{item}</option>
>>>>>>> 2ea456331d0280f0f4436421684651d159c2ff2a
              ))}
            </select>
          </div>
        </div>

<<<<<<< HEAD
        <div className="form-grid-2">
          <div className="field">
            <label>Idioma</label>
            <select
              value={form.idioma}
              onChange={(e) => update("idioma", e.target.value)}
            >
              {idiomas.map((item) => (
                <option key={item}>{item}</option>
=======
        <div className="grid">
          <div className="field">
            <label htmlFor="idioma">Idioma</label>
            <select id="idioma" value={form.idioma} onChange={(e) => update("idioma", e.target.value)}>
              {idiomas.map((item) => (
                <option key={item} value={item}>{item}</option>
>>>>>>> 2ea456331d0280f0f4436421684651d159c2ff2a
              ))}
            </select>
          </div>
          <div className="field">
<<<<<<< HEAD
            <label>Referência bíblica</label>
            <input
              value={form.referenciaBiblica}
              onChange={(e) => update("referenciaBiblica", e.target.value)}
              placeholder="Ex.: Romanos 12:4-5"
              required
=======
            <label htmlFor="referencia">Referência bíblica</label>
            <input
              id="referencia"
              value={form.referencia}
              onChange={(e) => update("referencia", e.target.value)}
              required
              placeholder="Ex.: Isaías 6:8; Mateus 28:19-20"
>>>>>>> 2ea456331d0280f0f4436421684651d159c2ff2a
            />
          </div>
        </div>

        <div className="field">
<<<<<<< HEAD
          <label>Texto da oração</label>
          <textarea
            value={form.textoOriginal}
            onChange={(e) => update("textoOriginal", e.target.value)}
            placeholder="Escreva o item de pauta de forma objetiva."
            required
          />
        </div>

        {message || error ? (
          <div className={`feedback ${error ? "error" : "success"}`}>
            {error || message}
          </div>
        ) : null}

        <div className="actions">
          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Enviando..." : "Enviar item"}
          </button>
=======
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
>>>>>>> 2ea456331d0280f0f4436421684651d159c2ff2a
        </div>
      </form>
    </section>
  );
}
