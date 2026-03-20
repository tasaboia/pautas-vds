import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const pautas = await prisma.pauta.findMany({
    orderBy: [{ criadoEm: "desc" }],
  });

  return NextResponse.json({ pautas });
}

export async function POST(request: Request) {
  const body = await request.json();

  const requiredFields = ["tipoOracao", "pauta", "referencia", "idioma"];
  const missing = requiredFields.find((field) => !body[field] || String(body[field]).trim() === "");

  if (missing) {
    return NextResponse.json({ error: `Campo obrigatório ausente: ${missing}` }, { status: 400 });
  }

  const pauta = await prisma.pauta.create({
    data: {
      tipoOracao: String(body.tipoOracao).trim(),
      pauta: String(body.pauta).trim(),
      referencia: String(body.referencia).trim(),
      idioma: String(body.idioma).trim(),
      categoria: body.categoria ? String(body.categoria).trim() : null,
      observacaoPublica: body.observacaoPublica ? String(body.observacaoPublica).trim() : null,
      textoFinal: String(body.pauta).trim(),
    },
  });

  return NextResponse.json({ pauta }, { status: 201 });
}
