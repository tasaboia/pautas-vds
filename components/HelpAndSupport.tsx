"use client";

import { useState } from "react";

type HelpAndSupportProps = {
  scope: "public" | "organizer";
};

const WHATSAPP_URL = "https://wa.me/351938991899";

export function HelpAndSupport({ scope }: HelpAndSupportProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="btn-outline"
        type="button"
        onClick={() => setOpen(true)}
      >
        Ajuda
      </button>
      <a
        className="btn-outline"
        href={WHATSAPP_URL}
        target="_blank"
        rel="noreferrer noopener"
      >
        Suporte WhatsApp
      </a>

      {open ? (
        <div className="help-modal-overlay" onClick={() => setOpen(false)}>
          <div className="help-modal" onClick={(e) => e.stopPropagation()}>
            <div className="help-modal-head">
              <h3>Ajuda do sistema</h3>
              <button
                className="btn-outline"
                type="button"
                onClick={() => setOpen(false)}
              >
                Fechar
              </button>
            </div>

            {scope === "public" ? (
              <div className="help-modal-body">
                <p>
                  Use este formulário para enviar um item individual de pauta. A
                  equipe interna revisa e decide em qual dia o item entra.
                </p>
                <ul>
                  <li>
                    Localidade: define para qual cidade o item será enviado.
                  </li>
                  <li>
                    Texto original e referência bíblica: são os dados
                    principais.
                  </li>
                  <li>
                    Depois de enviar, o item entra no fluxo de revisão da
                    equipe.
                  </li>
                </ul>
              </div>
            ) : (
              <div className="help-modal-body">
                <p>
                  Este painel organiza os itens recebidos por localidade, revisa
                  conteúdo e monta os dias de pauta.
                </p>
                <ul>
                  <li>
                    Filtros: busque por texto, status, categoria, tipo e idioma.
                  </li>
                  <li>
                    Edição de item: ajuste texto e referência e clique em
                    salvar.
                  </li>
                  <li>
                    Composição: adicione itens ao dia selecionado e ordene com
                    subir/descer.
                  </li>
                  <li>
                    Status do dia: não permite concluir dia sem itens na pauta.
                  </li>
                  <li>
                    Exportação: exporte dia atual, todos os dias ou intervalo da
                    localidade ativa.
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
