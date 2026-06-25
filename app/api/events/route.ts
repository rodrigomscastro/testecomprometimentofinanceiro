import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nanoid } from "nanoid";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const events = await prisma.event.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { submissions: true } } },
  });

  return NextResponse.json(
    events.map((e) => ({
      id: e.id,
      name: e.name,
      publicId: e.publicId,
      active: e.active,
      createdAt: e.createdAt,
      submissionCount: e._count.submissions,
    }))
  );
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const name = body?.name?.toString().trim();
  if (!name) {
    return NextResponse.json(
      { error: "Informe o nome do evento." },
      { status: 400 }
    );
  }

  const event = await prisma.event.create({
    data: { name, publicId: nanoid(10) },
  });

  return NextResponse.json(event, { status: 201 });
}
