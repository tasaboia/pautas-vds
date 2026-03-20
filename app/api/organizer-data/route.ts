import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ensurePrayerDays } from "@/lib/ensure-days";
import { prisma } from "@/lib/prisma";
import {
  getLocalityByCode,
  getLocalityCodeFromUrl,
} from "@/lib/locality-context";

export async function GET(request: Request) {
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

  const [items, days] = await Promise.all([
    prisma.prayerItem.findMany({
      where: { localityId: locality.id },
      orderBy: { criadoEm: "desc" },
      include: {
        composicoes: { select: { id: true, dayId: true, ordem: true } },
      },
    }),
    prisma.prayerDay.findMany({
      where: { localityId: locality.id },
      orderBy: { numero: "asc" },
      include: {
        itens: {
          orderBy: { ordem: "asc" },
          include: {
            item: {
              include: {
                composicoes: { select: { id: true, dayId: true, ordem: true } },
              },
            },
          },
        },
      },
    }),
  ]);

  return NextResponse.json({
    items,
    days,
    locality: { code: locality.code, name: locality.name },
  });
}
