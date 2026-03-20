"use client";

import { useEffect, useMemo, useState } from "react";
<<<<<<< HEAD
import {
  categorias,
  diaStatusOptions,
  idiomas,
  itemStatusOptions,
  tiposOracao,
} from "@/lib/options";
import {
  DEFAULT_LOCALITY,
  LOCALITIES,
  localityPathFromCode,
  type LocalityCode,
} from "@/lib/localities";

type Item = {
  id: number;
  textoOriginal: string;
  textoRevisado: string | null;
  referenciaBiblica: string;
  categoria: string | null;
  tipoOracao: string;
  idioma: string;
  observacaoPublica: string | null;
  observacaoInterna: string | null;
  status: string;
  composicoes: { id: number; dayId: number; ordem: number }[];
  criadoEm: string;
};

type DayItem = {
  id: number;
  ordem: number;
  item: Item;
};

type Day = {
  id: number;
  numero: number;
  titulo: string | null;
  descricao: string | null;
  status: string;
  itens: DayItem[];
};

type DashboardData = {
  items: Item[];
  days: Day[];
};

export function OrganizerDashboard({
  email,
  forcedLocality,
}: {
  email: string;
  forcedLocality?: LocalityCode;
}) {
  const [data, setData] = useState<DashboardData>({ items: [], days: [] });
  const [loading, setLoading] = useState(true);
  const [savingItemId, setSavingItemId] = useState<number | null>(null);
  const [savingDayText, setSavingDayText] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedLocality, setSelectedLocality] = useState<LocalityCode>(
    forcedLocality || DEFAULT_LOCALITY,
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [categoriaFilter, setCategoriaFilter] = useState("TODAS");
  const [tipoFilter, setTipoFilter] = useState("TODOS");
  const [idiomaFilter, setIdiomaFilter] = useState("TODOS");
  const [exportStartDay, setExportStartDay] = useState(1);
  const [exportEndDay, setExportEndDay] = useState(40);
  const [itemDrafts, setItemDrafts] = useState<
    Record<number, { textoOriginal: string; referenciaBiblica: string }>
  >({});
  const [dayDraft, setDayDraft] = useState({ titulo: "", descricao: "" });
  const [feedback, setFeedback] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const response = await fetch(
      `/api/organizer-data?locality=${selectedLocality}`,
      { cache: "no-store" },
    );
    const json = await response.json();
    setData(json);
=======
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
>>>>>>> 2ea456331d0280f0f4436421684651d159c2ff2a
    setLoading(false);
  }

  useEffect(() => {
    load();
<<<<<<< HEAD
  }, [selectedLocality]);

  useEffect(() => {
    if (!forcedLocality) return;
    setSelectedLocality(forcedLocality);
  }, [forcedLocality]);

  const currentDay = useMemo(
    () => data.days.find((day) => day.numero === selectedDay),
    [data.days, selectedDay],
  );

  useEffect(() => {
    setItemDrafts((prev) => {
      const next = { ...prev };
      for (const item of data.items) {
        if (!next[item.id]) {
          next[item.id] = {
            textoOriginal: item.textoOriginal || "",
            referenciaBiblica: item.referenciaBiblica || "",
          };
        }
      }
      return next;
    });
  }, [data.items]);

  useEffect(() => {
    setDayDraft({
      titulo: currentDay?.titulo || "",
      descricao: currentDay?.descricao || "",
    });
  }, [currentDay?.id]);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    return data.items.filter((item) => {
      const matchSearch =
        !term ||
        [
          item.textoOriginal,
          item.referenciaBiblica,
          item.categoria,
          item.tipoOracao,
          item.idioma,
          item.observacaoInterna,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term);
      const matchStatus =
        statusFilter === "TODOS" || item.status === statusFilter;
      const matchCategoria =
        categoriaFilter === "TODAS" || item.categoria === categoriaFilter;
      const matchTipo =
        tipoFilter === "TODOS" || item.tipoOracao === tipoFilter;
      const matchIdioma =
        idiomaFilter === "TODOS" || item.idioma === idiomaFilter;
      return (
        matchSearch && matchStatus && matchCategoria && matchTipo && matchIdioma
      );
    });
  }, [
    data.items,
    search,
    statusFilter,
    categoriaFilter,
    tipoFilter,
    idiomaFilter,
  ]);

  const stats = useMemo(
    () => ({
      totalItens: data.items.length,
      emRevisao: data.items.filter((item) => item.status === "EM_REVISAO")
        .length,
      aprovados: data.items.filter((item) => item.status === "APROVADO").length,
      diasMontagem: data.days.filter((day) => day.status === "EM_MONTAGEM")
        .length,
      diasConcluidos: data.days.filter((day) => day.status === "CONCLUIDO")
        .length,
      semDia: data.items.filter((item) => item.composicoes.length === 0).length,
    }),
    [data],
  );

  const availableDayNumbers = useMemo(
    () => data.days.map((day) => day.numero).sort((a, b) => a - b),
    [data.days],
  );

  useEffect(() => {
    if (availableDayNumbers.length === 0) return;
    setExportStartDay((prev) =>
      availableDayNumbers.includes(prev) ? prev : availableDayNumbers[0],
    );
    setExportEndDay((prev) =>
      availableDayNumbers.includes(prev)
        ? prev
        : availableDayNumbers[availableDayNumbers.length - 1],
    );
  }, [availableDayNumbers]);

  const normalizedExportStart = Math.min(exportStartDay, exportEndDay);
  const normalizedExportEnd = Math.max(exportStartDay, exportEndDay);
  const forcedLocalityPath = forcedLocality
    ? localityPathFromCode(forcedLocality)
    : null;
  const exportDayHref = forcedLocalityPath
    ? `/api/export/${forcedLocalityPath}/day/${selectedDay}`
    : `/api/export/day/${selectedDay}?locality=${selectedLocality}`;
  const exportAllHref = forcedLocalityPath
    ? `/api/export/${forcedLocalityPath}/days`
    : `/api/export/days?locality=${selectedLocality}`;
  const exportRangeHref = forcedLocalityPath
    ? `/api/export/${forcedLocalityPath}/days?start=${normalizedExportStart}&end=${normalizedExportEnd}`
    : `/api/export/days?start=${normalizedExportStart}&end=${normalizedExportEnd}&locality=${selectedLocality}`;

  async function patchItem(id: number, patch: Record<string, unknown>) {
    const response = await fetch(
      `/api/items/${id}?locality=${selectedLocality}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
        cache: "no-store",
      },
    );
    const json = await response.json();
    if (!response.ok) {
      setFeedback(json.error || "Não foi possível salvar o item.");
      return false;
    }
    await load();
    setFeedback("Item atualizado.");
    return true;
  }

  async function saveDay(patch: Record<string, unknown>) {
    const response = await fetch(
      `/api/days/${selectedDay}?locality=${selectedLocality}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      },
    );
    const json = await response.json();
    if (!response.ok) {
      setFeedback(json.error || "Não foi possível salvar o dia.");
      return false;
    }
    await load();
    setFeedback("Dia atualizado.");
    return true;
  }

  function hasItemDraftChanges(item: Item) {
    const draft = itemDrafts[item.id];
    if (!draft) return false;
    return (
      draft.textoOriginal !== (item.textoOriginal || "") ||
      draft.referenciaBiblica !== (item.referenciaBiblica || "")
    );
  }

  async function saveItemTextChanges(item: Item) {
    const draft = itemDrafts[item.id];
    if (!draft || !hasItemDraftChanges(item)) return;
    setSavingItemId(item.id);
    try {
      await patchItem(item.id, {
        textoOriginal: draft.textoOriginal,
        referenciaBiblica: draft.referenciaBiblica,
      });
    } finally {
      setSavingItemId(null);
    }
  }

  const hasDayTextChanges =
    dayDraft.titulo !== (currentDay?.titulo || "") ||
    dayDraft.descricao !== (currentDay?.descricao || "");
  const canConcludeDay = (currentDay?.itens.length || 0) > 0;

  async function saveDayTextChanges() {
    if (!hasDayTextChanges) return;
    setSavingDayText(true);
    try {
      await saveDay({
        titulo: dayDraft.titulo,
        descricao: dayDraft.descricao,
      });
    } finally {
      setSavingDayText(false);
    }
  }

  async function addToDay(itemId: number) {
    const response = await fetch(
      `/api/day-items?locality=${selectedLocality}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dayNumber: selectedDay, itemId }),
      },
    );
    const json = await response.json();
    if (!response.ok) {
      setFeedback(json.error || "Não foi possível adicionar ao dia.");
      return;
    }
    await load();
    setFeedback(`Item adicionado ao Dia ${selectedDay}.`);
  }

  async function updateDayItem(id: number, action: "UP" | "DOWN" | "REMOVE") {
    const response = await fetch(
      `/api/day-items/${id}?locality=${selectedLocality}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      },
    );
    const json = await response.json();
    if (!response.ok) {
      setFeedback(
        json.error || "Não foi possível atualizar a composição do dia.",
      );
      return;
    }
    await load();
    setFeedback("Composição atualizada.");
  }

  if (loading) return <div className="login-card">Carregando painel...</div>;

  return (
    <>
      <section className="hero">
        <div className="hero-card">
          <span className="badge">Área interna</span>
          <h2>Receber itens, revisar e montar cada de pauta.</h2>
          <p>
            Conectada como <strong>{email}</strong>. O painel foi estruturado em
            duas áreas: banco de itens à esquerda e composição do dia à direita.
          </p>
        </div>
        <aside className="side-card compact-side">
          <h3>Regras do fluxo</h3>
          <div className="flow">
            <div className="flow-item">
              <div className="flow-step">1</div>
              <div>
                <strong>Item individual</strong>
                <span>O público envia um item, não o dia completo.</span>
              </div>
            </div>
            <div className="flow-item">
              <div className="flow-step">2</div>
              <div>
                <strong>5 itens por dia</strong>
                <span>
                  O sistema ajuda a compor a pauta do dia com até 5 como média.
                </span>
              </div>
            </div>
            <div className="flow-item">
              <div className="flow-step">3</div>
              <div>
                <strong>Exportação final</strong>
                <span>Somente dias concluídos seguem para exportação.</span>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section className="stats">
        <div className="stat">
          <span>Itens recebidos</span>
          <strong>{stats.totalItens}</strong>
        </div>
        <div className="stat">
          <span>Em revisão</span>
          <strong>{stats.emRevisao}</strong>
        </div>
        <div className="stat">
          <span>Aprovados</span>
          <strong>{stats.aprovados}</strong>
        </div>
        <div className="stat">
          <span>Dias em montagem</span>
          <strong>{stats.diasMontagem}</strong>
        </div>
        <div className="stat">
          <span>Dias concluídos</span>
          <strong>{stats.diasConcluidos}</strong>
        </div>
        <div className="stat">
          <span>Sem dia</span>
          <strong>{stats.semDia}</strong>
        </div>
      </section>

      {feedback ? <div className="feedback success">{feedback}</div> : null}

      <section className="workspace">
        <aside className="sidebar">
          <h3>Banco de itens</h3>
          <p>Filtre, revise e escolha quais itens entram no dia selecionado.</p>
          <div className="field">
            <label>Localidade</label>
            <select
              value={selectedLocality}
              disabled={Boolean(forcedLocality)}
              onChange={(e) =>
                setSelectedLocality(e.target.value as LocalityCode)
              }
            >
              {LOCALITIES.map((locality) => (
                <option key={locality.code} value={locality.code}>
                  {locality.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Buscar</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Texto, referência, categoria..."
            />
          </div>
          <div className="field">
            <label>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="TODOS">Todos</option>
              {itemStatusOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Categoria</label>
            <select
              value={categoriaFilter}
              onChange={(e) => setCategoriaFilter(e.target.value)}
            >
              <option value="TODAS">Todas</option>
              {categorias.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Tipo de oração</label>
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
            >
              <option value="TODOS">Todos</option>
              {tiposOracao.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Idioma</label>
            <select
              value={idiomaFilter}
              onChange={(e) => setIdiomaFilter(e.target.value)}
            >
              <option value="TODOS">Todos</option>
              {idiomas.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Dia selecionado</label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(Number(e.target.value))}
            >
              {Array.from({ length: 40 }, (_, index) => index + 1).map(
                (day) => (
                  <option key={day} value={day}>
                    Dia {day}
                  </option>
                ),
              )}
            </select>
          </div>
          <div className="filter-note">
            <strong>Estrutura:</strong> cada dia é composto internamente. O item
            individual só vira parte do dia depois da curadoria.
          </div>
        </aside>

        <main className="panel">
          <div className="panel-head">
            <div>
              <h3>Composição do dia</h3>
              <p>
                À esquerda ficam os itens disponíveis. À direita, o dia em
                construção.
              </p>
            </div>
          </div>

          <div className="split">
            <section className="queue-section">
              {filteredItems.slice(0, 20).map((item) => {
                const alreadyInDay = item.composicoes.some(
                  (comp) => comp.dayId === currentDay?.id,
                );
                return (
                  <article className="queue-card" key={item.id}>
                    <div className="queue-top">
                      <div>
                        <div className="meta">
                          <span className="pill">#{item.id}</span>
                          <span className="pill">
                            {item.categoria || "Sem categoria"}
                          </span>
                          <span className="pill">{item.tipoOracao}</span>
                          <span className="pill">{item.idioma}</span>
                        </div>
                        <h4 className="queue-title">{item.textoOriginal}</h4>
                        <div className="queue-sub">
                          Recebido em{" "}
                          {new Date(item.criadoEm).toLocaleDateString("pt-BR")}
                        </div>
                      </div>
                      <span className="pill pill-status">
                        {itemStatusOptions.find((o) => o.value === item.status)
                          ?.label || item.status}
                      </span>
                    </div>

                    <div className="flex">
                      <div className="field">
                        <label>Status</label>
                        <select
                          value={item.status}
                          onChange={(e) =>
                            patchItem(item.id, { status: e.target.value })
                          }
                        >
                          {itemStatusOptions.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="field">
                        <label>Texto original</label>
                        <textarea
                          value={itemDrafts[item.id]?.textoOriginal || ""}
                          onChange={(e) =>
                            setItemDrafts((prev) => ({
                              ...prev,
                              [item.id]: {
                                textoOriginal: e.target.value,
                                referenciaBiblica:
                                  prev[item.id]?.referenciaBiblica || "",
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="field">
                        <label>Referência bíblica</label>
                        <input
                          value={itemDrafts[item.id]?.referenciaBiblica || ""}
                          onChange={(e) =>
                            setItemDrafts((prev) => ({
                              ...prev,
                              [item.id]: {
                                textoOriginal:
                                  prev[item.id]?.textoOriginal || "",
                                referenciaBiblica: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="actions">
                      <button
                        className="btn"
                        onClick={() => saveItemTextChanges(item)}
                        disabled={
                          !hasItemDraftChanges(item) || savingItemId === item.id
                        }
                      >
                        {savingItemId === item.id
                          ? "Salvando..."
                          : "Salvar alterações do item"}
                      </button>
                      <button
                        className="toggle"
                        onClick={() =>
                          patchItem(item.id, { status: "APROVADO" })
                        }
                      >
                        Aprovar item
                      </button>
                      <button
                        className="toggle"
                        onClick={() =>
                          patchItem(item.id, { status: "EM_REVISAO" })
                        }
                      >
                        Marcar revisão
                      </button>
                      <button
                        className="btn-outline"
                        onClick={() => addToDay(item.id)}
                        disabled={alreadyInDay}
                      >
                        {alreadyInDay
                          ? `Já está no Dia ${selectedDay}`
                          : `Adicionar ao Dia ${selectedDay}`}
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>

            <section className="compose-panel">
              <div className="compose-card">
                <div className="compose-head">
                  <div>
                    <h4>Dia {selectedDay} · pauta do dia</h4>
                    <p>Cada dia o ideal é trabalhar com até 5 itens.</p>
                  </div>
                  <span className="day-status">
                    {diaStatusOptions.find(
                      (o) => o.value === currentDay?.status,
                    )?.label || currentDay?.status}
                  </span>
                </div>

                <div className="field">
                  <label>Status do dia</label>
                  <select
                    value={currentDay?.status || "RASCUNHO"}
                    onChange={(e) => {
                      if (e.target.value === "CONCLUIDO" && !canConcludeDay) {
                        setFeedback(
                          "Adicione ao menos um item para concluir este dia.",
                        );
                        return;
                      }
                      saveDay({ status: e.target.value });
                    }}
                  >
                    {diaStatusOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="items">
                  {(currentDay?.itens || [])
                    .sort((a, b) => a.ordem - b.ordem)
                    .map((entry) => (
                      <div className="item" key={entry.id}>
                        <div className="order">{entry.ordem}</div>
                        <div>
                          <strong>{entry.item.textoOriginal}</strong>
                          <span>{entry.item.referenciaBiblica}</span>
                          <div className="item-tags">
                            <span className="pill">
                              {entry.item.categoria || "Sem categoria"}
                            </span>
                            <span className="pill">
                              {entry.item.tipoOracao}
                            </span>
                          </div>
                        </div>
                        <div className="item-action">
                          <button onClick={() => updateDayItem(entry.id, "UP")}>
                            Subir
                          </button>
                          <button
                            onClick={() => updateDayItem(entry.id, "DOWN")}
                          >
                            Descer
                          </button>
                          <button
                            onClick={() => updateDayItem(entry.id, "REMOVE")}
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                </div>

                <div className="actions" style={{ marginTop: 16 }}>
                  <button
                    className="btn-outline"
                    onClick={() => saveDay({ status: "EM_MONTAGEM" })}
                  >
                    Marcar em montagem
                  </button>
                  <button
                    className="btn-outline"
                    onClick={() => saveDay({ status: "CONCLUIDO" })}
                    disabled={!canConcludeDay}
                  >
                    Concluir este dia
                  </button>
                </div>
              </div>
            </section>
          </div>
        </main>
      </section>

      <section className="compose-card" style={{ marginTop: 20 }}>
        <div className="compose-head">
          <div>
            <h4>Exportação</h4>
            <p>
              Exporte o dia atual, todos os dias ou um intervalo específico.
            </p>
          </div>
        </div>

        <div className="actions" style={{ marginTop: 12 }}>
          <a className="btn" href={exportDayHref}>
            Exportar dia selecionado
          </a>
          <a className="btn-outline" href={exportAllHref}>
            Exportar todos os dias
          </a>
        </div>

        <div className="content-grid" style={{ marginTop: 12 }}>
          <div className="field">
            <label>Dia inicial</label>
            <select
              value={exportStartDay}
              onChange={(e) => setExportStartDay(Number(e.target.value))}
            >
              {availableDayNumbers.map((day) => (
                <option key={`start-${day}`} value={day}>
                  Dia {day}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Dia final</label>
            <select
              value={exportEndDay}
              onChange={(e) => setExportEndDay(Number(e.target.value))}
            >
              {availableDayNumbers.map((day) => (
                <option key={`end-${day}`} value={day}>
                  Dia {day}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="actions">
          <a className="btn" href={exportRangeHref}>
            Exportar intervalo
          </a>
        </div>
      </section>
    </>
=======
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
>>>>>>> 2ea456331d0280f0f4436421684651d159c2ff2a
  );
}
