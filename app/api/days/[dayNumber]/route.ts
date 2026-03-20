import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { ensurePrayerDays } from "@/lib/ensure-days";
import { prisma } from "@/lib/prisma";
import {
  getLocalityByCode,
  getLocalityCodeFromUrl,
} from "@/lib/locality-context";

type Params = { params: Promise<{ dayNumber: string }> };

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

  await ensurePrayerDays(locality.code);
  const { dayNumber } = await params;
  const numero = Number(dayNumber);
  const body = await request.json();

  if (body.status === "CONCLUIDO") {
    const dayWithItems = await prisma.prayerDay.findUnique({
      where: { localityId_numero: { localityId: locality.id, numero } },
      select: { id: true, itens: { select: { id: true }, take: 1 } },
    });

    if (!dayWithItems || dayWithItems.itens.length === 0) {
      return NextResponse.json(
        { error: "Não é possível concluir um dia sem itens de pauta." },
        { status: 400 },
      );
    }
  }

  const day = await prisma.prayerDay.update({
    where: { localityId_numero: { localityId: locality.id, numero } },
    data: {
      titulo: typeof body.titulo === "string" ? body.titulo : undefined,
      descricao:
        typeof body.descricao === "string" ? body.descricao : undefined,
      status: typeof body.status === "string" ? body.status : undefined,
      concluidoEm: body.status === "CONCLUIDO" ? new Date() : undefined,
    },
  });
  return NextResponse.json({ day });
}
