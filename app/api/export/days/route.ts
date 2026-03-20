import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ensurePrayerDays } from "@/lib/ensure-days";
import { prisma } from "@/lib/prisma";
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import {
  getLocalityByCode,
  getLocalityCodeFromUrl,
} from "@/lib/locality-context";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const localityCode = getLocalityCodeFromUrl(request);
  const locality = await getLocalityByCode(localityCode);
  if (!locality) {
    return NextResponse.json(
      { error: "Localidade inválida." },
      { status: 400 },
    );
  }

  await ensurePrayerDays(locality.code);

  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  const rangeFilter =
    start && end
      ? {
          localityId: locality.id,
          numero: {
            gte: Number(start),
            lte: Number(end),
          },
        }
      : { localityId: locality.id };

  if (start && end) {
    const startNumber = Number(start);
    const endNumber = Number(end);

    if (!Number.isInteger(startNumber) || !Number.isInteger(endNumber)) {
      return NextResponse.json(
        { error: "Intervalo inválido para exportação." },
        { status: 400 },
      );
    }

    if (startNumber > endNumber) {
      return NextResponse.json(
        { error: "O dia inicial deve ser menor ou igual ao dia final." },
        { status: 400 },
      );
    }
  }

  const days = await prisma.prayerDay.findMany({
    where: rangeFilter,
    orderBy: { numero: "asc" },
    include: {
      itens: {
        orderBy: { ordem: "asc" },
        include: { item: true },
      },
    },
  });

  if (days.length === 0) {
    return NextResponse.json(
      { error: "Nenhum dia encontrado para exportar." },
      { status: 404 },
    );
  }

  const children: Paragraph[] = [];

  days.forEach((day, dayIndex) => {
    children.push(
      new Paragraph({
        text: `Dia ${day.numero}`,
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: dayIndex > 0,
      }),
    );

    if (day.titulo) {
      children.push(new Paragraph({ text: day.titulo }));
    }

    if (day.descricao) {
      children.push(new Paragraph({ text: day.descricao }));
    }

    children.push(new Paragraph({ text: "" }));

    if (day.itens.length === 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: "Sem itens na pauta.", italics: true }),
          ],
        }),
        new Paragraph({ text: "" }),
      );
      return;
    }

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
  });

  const doc = new Document({ sections: [{ properties: {}, children }] });
  const buffer = await Packer.toBuffer(doc);

  const fileName =
    start && end
      ? `pauta-dias-${start}-${end}.docx`
      : "pauta-todos-os-dias.docx";

  return new NextResponse(buffer as BodyInit, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
