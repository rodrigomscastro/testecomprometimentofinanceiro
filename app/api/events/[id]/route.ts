import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);

  const data: { active?: boolean; name?: string } = {};
  if (typeof body?.active === "boolean") data.active = body.active;
  if (body?.name !== undefined) {
    const name = body.name.toString().trim();
    if (!name) {
      return NextResponse.json(
        { error: "Informe o nome do evento." },
        { status: 400 }
      );
    }
    data.name = name;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const event = await prisma.event.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json(event);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  await prisma.event.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
