import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ensurePrayerDays } from "@/lib/ensure-days";
import { prisma } from "@/lib/prisma";
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import { localityCodeFromPath } from "@/lib/localities";
import { getLocalityByCode } from "@/lib/locality-context";

type Params = { params: Promise<{ localityPath: string; dayNumber: string }> };

export async function GET(_: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { localityPath, dayNumber } = await params;
  const localityCode = localityCodeFromPath(localityPath);
  if (!localityCode) {
    return NextResponse.json(
      { error: "Localidade inválida." },
      { status: 400 },
    );
  }

  const locality = await getLocalityByCode(localityCode);
  if (!locality) {
    return NextResponse.json(
      { error: "Localidade inválida." },
      { status: 400 },
    );
  }

  await ensurePrayerDays(locality.code);
  const numero = Number(dayNumber);
  const day = await prisma.prayerDay.findUnique({
    where: { localityId_numero: { localityId: locality.id, numero } },
    include: { itens: { orderBy: { ordem: "asc" }, include: { item: true } } },
  });

  if (!day) {
    return NextResponse.json({ error: "Dia não encontrado." }, { status: 404 });
  }

  const children = [
    new Paragraph({
      text: `Dia ${day.numero}`,
      heading: HeadingLevel.HEADING_1,
    }),
    ...(day.titulo ? [new Paragraph({ text: day.titulo })] : []),
    ...(day.descricao ? [new Paragraph({ text: day.descricao })] : []),
    new Paragraph({ text: "" }),
  ];

  day.itens.forEach((entry, index) => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${index + 1}. ${entry.item.textoOriginal}`,
            bold: true,
          }),
        ],
      }),
      new Paragraph({ text: entry.item.referenciaBiblica }),
      new Paragraph({ text: "" }),
    );
  });

  const doc = new Document({ sections: [{ properties: {}, children }] });
  const buffer = await Packer.toBuffer(doc);

  return new NextResponse(buffer as BodyInit, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="dia-${day.numero}.docx"`,
    },
  });
}
