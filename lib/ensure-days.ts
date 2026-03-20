import { prisma } from "@/lib/prisma";
import { DEFAULT_LOCALITY } from "@/lib/localities";
import { getLocalityByCode } from "@/lib/locality-context";

export async function ensurePrayerDays(
  localityCode: string = DEFAULT_LOCALITY,
) {
  const locality = await getLocalityByCode(localityCode);
  if (!locality) return;

  const count = await prisma.prayerDay.count({
    where: { localityId: locality.id },
  });
  if (count >= 40) return;

  const existing = await prisma.prayerDay.findMany({
    where: { localityId: locality.id },
    select: { numero: true },
  });
  const existingSet = new Set(existing.map((d) => d.numero));
  const data = [];
  for (let numero = 1; numero <= 40; numero++) {
    if (!existingSet.has(numero)) {
      data.push({
        numero,
        status: "RASCUNHO" as const,
        localityId: locality.id,
      });
    }
  }
  if (data.length) {
    await prisma.prayerDay.createMany({ data });
  }
}
