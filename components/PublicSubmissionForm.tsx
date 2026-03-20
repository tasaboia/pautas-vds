"use client";

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
  observacaoPublica: string;
};

const initialState: FormState = {
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
  const [form, setForm] = useState<FormState>(() => ({
    ...initialState,
    locality: forcedLocality || initialState.locality,
  }));
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

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
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
      setForm((prev) => ({
        ...initialState,
        // Preserve the active locality so consecutive submissions stay scoped.
        locality: forcedLocality || prev.locality,
      }));
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
              ))}
            </select>
          </div>
          <div className="field">
            <label>Tipo de oração</label>
            <select
              value={form.tipoOracao}
              onChange={(e) => update("tipoOracao", e.target.value)}
            >
              {tiposOracao.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-grid-2">
          <div className="field">
            <label>Idioma</label>
            <select
              value={form.idioma}
              onChange={(e) => update("idioma", e.target.value)}
            >
              {idiomas.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Referência bíblica</label>
            <input
              value={form.referenciaBiblica}
              onChange={(e) => update("referenciaBiblica", e.target.value)}
              placeholder="Ex.: Romanos 12:4-5"
              required
            />
          </div>
        </div>

        <div className="field">
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
        </div>
      </form>
    </section>
  );
}
