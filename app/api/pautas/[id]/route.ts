import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma, StatusPauta } from "@prisma/client";

function parseStatus(value: unknown): StatusPauta | undefined {
  if (!value) return undefined;
  const valid = Object.values(StatusPauta).includes(value as StatusPauta);
  return valid ? (value as StatusPauta) : undefined;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const data: Prisma.PautaUpdateInput = {};

  if (typeof body.status === "string") {
    const parsed = parseStatus(body.status);
    if (!parsed) {
      return NextResponse.json({ error: "Status inválido." }, { status: 400 });
    }
    data.status = parsed;
  }

  if (typeof body.revisada === "boolean") data.revisada = body.revisada;
  if (typeof body.enviadaParaTami === "boolean") data.enviadaParaTami = body.enviadaParaTami;
  if (body.dia === null || typeof body.dia === "number") data.dia = body.dia;
  if (body.ordemNoDia === null || typeof body.ordemNoDia === "number") data.ordemNoDia = body.ordemNoDia;
  if (body.observacoesInternas === null || typeof body.observacoesInternas === "string") {
    data.observacoesInternas = body.observacoesInternas;
  }
  if (body.textoFinal === null || typeof body.textoFinal === "string") {
    data.textoFinal = body.textoFinal;
  }

  const pauta = await prisma.pauta.update({
    where: { id: Number(id) },
    data,
  });

  return NextResponse.json({ pauta });
}
