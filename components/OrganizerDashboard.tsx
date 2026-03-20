"use client";

import { useEffect, useMemo, useState } from "react";
import { categorias, idiomas, statusOptions } from "@/lib/options";

type Pauta = {
  id: number;
  tipoOracao: string;
  pauta: string;
  referencia: string;
  idioma: string;
  categoria: string | null;
  observacaoPublica: string | null;
  textoFinal: string | null;
  status: string;
  revisada: boolean;
  enviadaParaTami: boolean;
  dia: number | null;
  ordemNoDia: number | null;
  observacoesInternas: string | null;
  criadoEm: string;
};

type ViewMode = "fila" | "planejamento" | "exportar";

function statusLabel(value: string) {
  return statusOptions.find((item) => item.value === value)?.label ?? value;
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function OrganizerDashboard() {
  const [pautas, setPautas] = useState<Pauta[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [categoryFilter, setCategoryFilter] = useState("TODAS");
  const [languageFilter, setLanguageFilter] = useState("TODOS");
  const [dayFilter, setDayFilter] = useState("TODOS");
  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [activeView, setActiveView] = useState<ViewMode>("fila");

  async function load() {
    setLoading(true);
    const response = await fetch("/api/pautas");
    const data = await response.json();
    setPautas(data.pautas || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return pautas.filter((item) => {
      const matchStatus = statusFilter === "TODOS" ? true : item.status === statusFilter;
      const matchCategory = categoryFilter === "TODAS" ? true : (item.categoria || "") === categoryFilter;
      const matchLanguage = languageFilter === "TODOS" ? true : item.idioma === languageFilter;
      const matchDay =
        dayFilter === "TODOS"
          ? true
          : dayFilter === "SEM_DIA"
            ? item.dia == null
            : item.dia === Number(dayFilter);

      const term = normalizeText(search.trim());
      const haystack = normalizeText(
        [
          item.tipoOracao,
          item.pauta,
          item.referencia,
          item.idioma,
          item.categoria || "",
          item.textoFinal || "",
          item.observacaoPublica || "",
          item.observacoesInternas || "",
        ].join(" ")
      );
      const matchSearch = term ? haystack.includes(term) : true;
      return matchStatus && matchCategory && matchLanguage && matchDay && matchSearch;
    });
  }, [pautas, statusFilter, categoryFilter, languageFilter, dayFilter, search]);

  const stats = useMemo(() => {
    const revisadas = pautas.filter((p) => p.revisada).length;
    const selecionadas = pautas.filter((p) => p.status === "SELECIONADA").length;
    const enviadas = pautas.filter((p) => p.enviadaParaTami || p.status === "ENVIADA_TAMI").length;
    const semDia = pautas.filter((p) => p.dia == null).length;
    const outrosIdiomas = pautas.filter((p) => !normalizeText(p.idioma).includes("portugues")).length;
    const prontasParaArte = pautas.filter(
      (p) => p.revisada && p.dia != null && !!p.textoFinal && !p.enviadaParaTami
    ).length;

    return {
      total: pautas.length,
      revisadas,
      selecionadas,
      enviadas,
      semDia,
      outrosIdiomas,
      prontasParaArte,
    };
  }, [pautas]);

  const groupedByDay = useMemo(() => {
    const onlyScheduled = pautas
      .filter((item) => item.dia != null)
      .sort((a, b) => {
        if ((a.dia || 0) !== (b.dia || 0)) return (a.dia || 0) - (b.dia || 0);
        if ((a.ordemNoDia || 999) !== (b.ordemNoDia || 999)) return (a.ordemNoDia || 999) - (b.ordemNoDia || 999);
        return a.id - b.id;
      });

    return onlyScheduled.reduce<Record<number, Pauta[]>>((acc, item) => {
      const key = item.dia as number;
      acc[key] = acc[key] || [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [pautas]);

  const exportText = useMemo(() => {
    const days = Object.keys(groupedByDay)
      .map(Number)
      .sort((a, b) => a - b);

    if (days.length === 0) return "Ainda não há pautas com dia definido.";

    return days
      .map((day) => {
        const items = groupedByDay[day]
          .slice()
          .sort((a, b) => (a.ordemNoDia || 999) - (b.ordemNoDia || 999));

        const lines = items.map((item, index) => {
          const titulo = `${index + 1}. [${item.categoria || "Sem categoria"}] ${item.textoFinal || item.pauta}`;
          const meta = `   ${item.referencia}`;
          return `${titulo}\n${meta}`;
        });

        return `DIA ${day}\n${lines.join("\n\n")}`;
      })
      .join("\n\n------------------------------\n\n");
  }, [groupedByDay]);

  async function updatePauta(id: number, patch: Partial<Pauta>) {
    setSavingId(id);
    const response = await fetch(`/api/pautas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });

    if (response.ok) {
      const data = await response.json();
      setPautas((prev) => prev.map((item) => (item.id === id ? data.pauta : item)));
    }

    setSavingId(null);
  }

  async function copyExport() {
    await navigator.clipboard.writeText(exportText);
    window.alert("Texto copiado para colar e enviar para a Tami.");
  }

  if (loading) {
    return <div className="card"><p>Carregando pautas...</p></div>;
  }

  return (
    <div className="dashboard-shell">
      <section className="spotlight">
        <div>
          <span className="badge badge-soft">Curadoria editorial</span>
          <h2 className="section-title">Central de revisão, planejamento por dia e saída para arte</h2>
          <p className="small" style={{ maxWidth: 720 }}>
            Este painel foi pensado para parecer uma ferramenta interna profissional: uma fila clara de revisão,
            visão de planejamento por dia e exportação prática para a Tami.
          </p>
        </div>
        <div className="spotlight-actions">
          <button className={`tab-btn ${activeView === "fila" ? "active" : ""}`} onClick={() => setActiveView("fila")}>Fila editorial</button>
          <button className={`tab-btn ${activeView === "planejamento" ? "active" : ""}`} onClick={() => setActiveView("planejamento")}>Planejamento por dia</button>
          <button className={`tab-btn ${activeView === "exportar" ? "active" : ""}`} onClick={() => setActiveView("exportar")}>Exportar p/ Tami</button>
        </div>
      </section>

      <div className="kpis kpis-extended">
        <div className="kpi"><div className="small">Total recebidas</div><div className="kpi-value">{stats.total}</div></div>
        <div className="kpi"><div className="small">Revisadas</div><div className="kpi-value">{stats.revisadas}</div></div>
        <div className="kpi"><div className="small">Selecionadas p/ dia</div><div className="kpi-value">{stats.selecionadas}</div></div>
        <div className="kpi"><div className="small">Prontas para arte</div><div className="kpi-value">{stats.prontasParaArte}</div></div>
        <div className="kpi"><div className="small">Sem dia definido</div><div className="kpi-value">{stats.semDia}</div></div>
        <div className="kpi"><div className="small">Em outro idioma</div><div className="kpi-value">{stats.outrosIdiomas}</div></div>
      </div>

      {activeView === "fila" ? (
        <div className="card panel-card">
          <div className="panel-head">
            <div>
              <h3>Fila editorial</h3>
              <p className="small">Filtre, revise, ajuste o texto final e distribua por dia.</p>
            </div>
            <button className="btn secondary" onClick={load}>Atualizar lista</button>
          </div>

          <div className="toolbar toolbar-grid">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por pauta, referência, categoria ou observação..."
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="TODOS">Todos os status</option>
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="TODAS">Todas as categorias</option>
              {categorias.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <select value={languageFilter} onChange={(e) => setLanguageFilter(e.target.value)}>
              <option value="TODOS">Todos os idiomas</option>
              {idiomas.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <select value={dayFilter} onChange={(e) => setDayFilter(e.target.value)}>
              <option value="TODOS">Todos os dias</option>
              <option value="SEM_DIA">Sem dia</option>
              {Array.from({ length: 40 }, (_, index) => index + 1).map((day) => (
                <option key={day} value={String(day)}>Dia {day}</option>
              ))}
            </select>
          </div>

          <div className="list">
            {filtered.map((item) => (
              <div key={item.id} className="table-card card-elevated">
                <div className="row row-between">
                  <div>
                    <div className="row">
                      <span className="pill pill-strong">#{item.id}</span>
                      <span className="pill">{item.categoria || "Sem categoria"}</span>
                      <span className="pill">{item.tipoOracao}</span>
                      <span className="pill">{item.idioma}</span>
                    </div>
                    <h3 style={{ marginTop: 12 }}>{item.textoFinal || item.pauta}</h3>
                    <p className="small">Recebida em {new Date(item.criadoEm).toLocaleDateString("pt-BR")} · status atual: <strong>{statusLabel(item.status)}</strong></p>
                  </div>
                  <div className="status-stack">
                    <span className="status-chip">{statusLabel(item.status)}</span>
                    {item.dia ? <span className="small">Dia {item.dia}{item.ordemNoDia ? ` · ordem ${item.ordemNoDia}` : ""}</span> : <span className="small">Sem dia definido</span>}
                  </div>
                </div>

                <div className="comparison-grid">
                  <div className="notice">
                    <p><strong>Texto original enviado</strong></p>
                    <p className="small">{item.pauta}</p>
                  </div>
                  <div className="notice">
                    <p><strong>Referência bíblica</strong></p>
                    <p className="small">{item.referencia}</p>
                    {item.observacaoPublica ? (
                      <>
                        <p style={{ marginTop: 10 }}><strong>Observação pública</strong></p>
                        <p className="small">{item.observacaoPublica}</p>
                      </>
                    ) : null}
                  </div>
                </div>

                <div className="grid-3">
                  <div className="field">
                    <label>Status</label>
                    <select
                      value={item.status}
                      onChange={(e) => updatePauta(item.id, { status: e.target.value })}
                    >
                      {statusOptions.map((status) => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>Dia</label>
                    <input
                      type="number"
                      min={1}
                      max={40}
                      value={item.dia ?? ""}
                      onChange={(e) =>
                        updatePauta(item.id, {
                          dia: e.target.value === "" ? null : Number(e.target.value),
                        })
                      }
                      placeholder="Ex.: 1"
                    />
                  </div>
                  <div className="field">
                    <label>Ordem no dia</label>
                    <input
                      type="number"
                      min={1}
                      value={item.ordemNoDia ?? ""}
                      onChange={(e) =>
                        updatePauta(item.id, {
                          ordemNoDia: e.target.value === "" ? null : Number(e.target.value),
                        })
                      }
                      placeholder="Ex.: 3"
                    />
                  </div>
                </div>

                <div className="field">
                  <label>Texto final aprovado</label>
                  <textarea
                    value={item.textoFinal ?? ""}
                    onChange={(e) =>
                      setPautas((prev) =>
                        prev.map((current) =>
                          current.id === item.id ? { ...current, textoFinal: e.target.value } : current
                        )
                      )
                    }
                    placeholder="Ajuste aqui a versão final da pauta"
                  />
                </div>

                <div className="field">
                  <label>Observações internas</label>
                  <textarea
                    value={item.observacoesInternas ?? ""}
                    onChange={(e) =>
                      setPautas((prev) =>
                        prev.map((current) =>
                          current.id === item.id ? { ...current, observacoesInternas: e.target.value } : current
                        )
                      )
                    }
                    placeholder="Anote contexto, ajuste editorial, tradução ou instrução interna"
                  />
                </div>

                <div className="row-actions">
                  <button className="btn secondary" onClick={() => updatePauta(item.id, { revisada: !item.revisada })}>
                    {item.revisada ? "Desmarcar revisão" : "Marcar como revisada"}
                  </button>
                  <button className="btn secondary" onClick={() => updatePauta(item.id, { enviadaParaTami: !item.enviadaParaTami })}>
                    {item.enviadaParaTami ? "Desmarcar envio à Tami" : "Marcar envio à Tami"}
                  </button>
                  <button
                    className="btn"
                    onClick={() =>
                      updatePauta(item.id, {
                        textoFinal: item.textoFinal,
                        observacoesInternas: item.observacoesInternas,
                      })
                    }
                    disabled={savingId === item.id}
                  >
                    {savingId === item.id ? "Salvando..." : "Salvar edição"}
                  </button>
                </div>
              </div>
            ))}

            {filtered.length === 0 ? <p className="small">Nenhuma pauta encontrada com esse filtro.</p> : null}
          </div>
        </div>
      ) : null}

      {activeView === "planejamento" ? (
        <div className="card panel-card">
          <div className="panel-head">
            <div>
              <h3>Planejamento por dia</h3>
              <p className="small">Veja a distribuição das pautas já agendadas e a ordem de cada dia.</p>
            </div>
          </div>

          {Object.keys(groupedByDay).length === 0 ? (
            <p className="small">Ainda não há pautas com dia definido.</p>
          ) : (
            <div className="days-grid">
              {Object.keys(groupedByDay)
                .map(Number)
                .sort((a, b) => a - b)
                .map((day) => (
                  <div key={day} className="day-card">
                    <div className="day-card-head">
                      <div>
                        <div className="badge badge-soft">Dia {day}</div>
                        <h3 style={{ marginTop: 10 }}>Pautas programadas</h3>
                      </div>
                      <span className="small">{groupedByDay[day].length} pauta(s)</span>
                    </div>
                    <div className="day-list">
                      {groupedByDay[day]
                        .slice()
                        .sort((a, b) => (a.ordemNoDia || 999) - (b.ordemNoDia || 999))
                        .map((item, index) => (
                          <div key={item.id} className="day-item">
                            <div className="day-order">{item.ordemNoDia || index + 1}</div>
                            <div>
                              <p><strong>{item.textoFinal || item.pauta}</strong></p>
                              <p className="small">{item.referencia}</p>
                              <div className="row">
                                <span className="pill">{item.categoria || "Sem categoria"}</span>
                                <span className="pill">{item.tipoOracao}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      ) : null}

      {activeView === "exportar" ? (
        <div className="card panel-card">
          <div className="panel-head">
            <div>
              <h3>Exportar para a Tami</h3>
              <p className="small">Gere um bloco de texto limpo, separado por dia, para copiar e enviar.</p>
            </div>
            <button className="btn" onClick={copyExport}>Copiar texto</button>
          </div>
          <div className="export-box">
            <pre>{exportText}</pre>
          </div>
        </div>
      ) : null}
    </div>
  );
}
