import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ensurePrayerDays } from "@/lib/ensure-days";
import { prisma } from "@/lib/prisma";
import {
  getLocalityByCode,
  getLocalityCodeFromUrl,
} from "@/lib/locality-context";

export async function POST(request: Request) {
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
  const body = await request.json();
  const dayNumber = Number(body.dayNumber);
  const itemId = Number(body.itemId);

  const day = await prisma.prayerDay.findUnique({
    where: {
      localityId_numero: { localityId: locality.id, numero: dayNumber },
    },
    include: { itens: true },
  });
  if (!day)
    return NextResponse.json({ error: "Dia não encontrado." }, { status: 404 });
  if (day.itens.length >= 6)
    return NextResponse.json(
      { error: "Esse dia já tem 6 itens." },
      { status: 400 },
    );

  const exists = await prisma.dayItem.findFirst({
    where: { dayId: day.id, itemId },
  });
  if (exists)
    return NextResponse.json(
      { error: "Esse item já está neste dia." },
      { status: 400 },
    );

  const item = await prisma.prayerItem.findUnique({ where: { id: itemId } });
  if (!item || item.localityId !== locality.id) {
    return NextResponse.json(
      { error: "Esse item não pertence a esta localidade." },
      { status: 400 },
    );
  }

  const [entry] = await prisma.$transaction([
    prisma.dayItem.create({
      data: { dayId: day.id, itemId, ordem: day.itens.length + 1 },
    }),
    prisma.prayerItem.update({
      where: { id: itemId },
      data: { status: "APROVADO" },
    }),
  ]);

  return NextResponse.json({ entry }, { status: 201 });
}
