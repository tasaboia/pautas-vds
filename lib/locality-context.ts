import { prisma } from "@/lib/prisma";
import { LOCALITIES, normalizeLocalityCode } from "@/lib/localities";

export function getLocalityCodeFromUrl(request: Request) {
  const { searchParams } = new URL(request.url);
  return normalizeLocalityCode(searchParams.get("locality"));
}

export async function ensureLocalities() {
  for (const locality of LOCALITIES) {
    await prisma.locality.upsert({
      where: { code: locality.code },
      update: { name: locality.name },
      create: { code: locality.code, name: locality.name },
    });
  }
}

export async function getLocalityByCode(code: string) {
  await ensureLocalities();
  const normalizedCode = normalizeLocalityCode(code);
  return prisma.locality.findUnique({ where: { code: normalizedCode } });
}
