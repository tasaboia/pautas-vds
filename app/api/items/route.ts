import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLocalityByCode } from "@/lib/locality-context";

export async function POST(request: Request) {
  const body = await request.json();
  if (
    !body.textoOriginal ||
    !body.referenciaBiblica ||
    !body.tipoOracao ||
    !body.idioma
  ) {
    return NextResponse.json(
      { error: "Preencha texto, referência, tipo de oração e idioma." },
      { status: 400 },
    );
  }

  const locality = await getLocalityByCode(body.locality);
  if (!locality) {
    return NextResponse.json(
      { error: "Localidade inválida." },
      { status: 400 },
    );
  }

  const item = await prisma.prayerItem.create({
    data: {
      localityId: locality.id,
      textoOriginal: String(body.textoOriginal).trim(),
      referenciaBiblica: String(body.referenciaBiblica).trim(),
      categoria: body.categoria ? String(body.categoria).trim() : null,
      tipoOracao: String(body.tipoOracao).trim(),
      idioma: String(body.idioma).trim(),
      observacaoPublica: body.observacaoPublica
        ? String(body.observacaoPublica).trim()
        : null,
      status: "RECEBIDO",
    },
  });

  return NextResponse.json({ item }, { status: 201 });
}
