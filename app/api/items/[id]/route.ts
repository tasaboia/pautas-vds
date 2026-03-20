import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  getLocalityByCode,
  getLocalityCodeFromUrl,
} from "@/lib/locality-context";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const localityCode = getLocalityCodeFromUrl(request);
  const locality = await getLocalityByCode(localityCode);
  if (!locality)
    return NextResponse.json(
      { error: "Localidade inválida." },
      { status: 400 },
    );

  const { id } = await params;
  const itemId = Number(id);
  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (typeof body.textoOriginal === "string")
    data.textoOriginal = body.textoOriginal;
  if (typeof body.referenciaBiblica === "string")
    data.referenciaBiblica = body.referenciaBiblica;
  if (typeof body.textoRevisado === "string")
    data.textoRevisado = body.textoRevisado;
  if (body.textoRevisado === null) data.textoRevisado = null;
  if (typeof body.observacaoInterna === "string")
    data.observacaoInterna = body.observacaoInterna;
  if (body.observacaoInterna === null) data.observacaoInterna = null;
  if (typeof body.status === "string") data.status = body.status;

  const existingItem = await prisma.prayerItem.findUnique({
    where: { id: itemId },
  });
  if (!existingItem || existingItem.localityId !== locality.id) {
    return NextResponse.json(
      { error: "Item fora da localidade selecionada." },
      { status: 400 },
    );
  }

  const item = await prisma.prayerItem.update({ where: { id: itemId }, data });
  return NextResponse.json({ item });
}
