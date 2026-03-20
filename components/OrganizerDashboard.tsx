"use client";

import { useEffect, useMemo, useState } from "react";
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
  locality?: {
    code: LocalityCode;
    name: string;
  };
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
  const [feedback, setFeedback] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const response = await fetch(
      `/api/organizer-data?locality=${selectedLocality}`,
      { cache: "no-store" },
    );
    const json = await response.json();
    setData(json);
    setLoading(false);
  }

  useEffect(() => {
    load();
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

  const activeLocalityName =
    data.locality?.name ||
    LOCALITIES.find((locality) => locality.code === selectedLocality)?.name ||
    selectedLocality;

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

  const canConcludeDay = (currentDay?.itens.length || 0) > 0;

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
          <h2>Receber itens, revisar e montar cada pauta.</h2>
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
        <div className="stat" style={{ gridColumn: "1 / -1" }}>
          <span>Localidade ativa nos indicadores</span>
          <strong>{activeLocalityName}</strong>
        </div>
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
  );
}
