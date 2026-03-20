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
  const entryId = Number(id);
  const body = await request.json();

  const current = await prisma.dayItem.findUnique({
    where: { id: entryId },
    include: { day: { select: { localityId: true } } },
  });
  if (!current)
    return NextResponse.json(
      { error: "Item da composição não encontrado." },
      { status: 404 },
    );
  if (current.day.localityId !== locality.id) {
    return NextResponse.json(
      { error: "Item fora da localidade selecionada." },
      { status: 400 },
    );
  }

  if (body.action === "REMOVE") {
    await prisma.dayItem.delete({ where: { id: entryId } });
    const remaining = await prisma.dayItem.findMany({
      where: { dayId: current.dayId },
      orderBy: { ordem: "asc" },
    });
    for (let index = 0; index < remaining.length; index++) {
      await prisma.dayItem.update({
        where: { id: remaining[index].id },
        data: { ordem: index + 1 },
      });
    }
    return NextResponse.json({ ok: true });
  }

  const targetOrder =
    body.action === "UP" ? current.ordem - 1 : current.ordem + 1;
  const swap = await prisma.dayItem.findFirst({
    where: { dayId: current.dayId, ordem: targetOrder },
  });
  if (!swap) return NextResponse.json({ ok: true });

  await prisma.$transaction([
    prisma.dayItem.update({ where: { id: current.id }, data: { ordem: 999 } }),
    prisma.dayItem.update({
      where: { id: swap.id },
      data: { ordem: current.ordem },
    }),
    prisma.dayItem.update({
      where: { id: current.id },
      data: { ordem: swap.ordem },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
