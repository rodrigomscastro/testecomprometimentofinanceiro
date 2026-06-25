import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeResult, RESULT_BANDS, type OptionKey } from "@/lib/quiz";
import { validateProfile } from "@/lib/profile";

export async function POST(
  req: Request,
  { params }: { params: { publicId: string } }
) {
  const event = await prisma.event.findUnique({
    where: { publicId: params.publicId },
  });

  if (!event || !event.active) {
    return NextResponse.json(
      { error: "Este teste não está disponível." },
      { status: 404 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  let profile;
  try {
    profile = validateProfile(body.profile);
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 400 }
    );
  }

  // Normaliza o mapa de respostas { [q]: "A"|"B"|"C" }
  const rawAnswers = body.answers;
  if (!rawAnswers || typeof rawAnswers !== "object") {
    return NextResponse.json(
      { error: "Responda todas as perguntas." },
      { status: 400 }
    );
  }

  const answersMap: Record<number, OptionKey> = {};
  for (const [k, v] of Object.entries(rawAnswers)) {
    answersMap[Number(k)] = v as OptionKey;
  }

  let result;
  try {
    result = computeResult(answersMap);
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 400 }
    );
  }

  await prisma.submission.create({
    data: {
      eventId: event.id,
      score: result.score,
      category: result.category,
      answers: result.records as unknown as object[],
      ...profile,
    },
  });

  const band = RESULT_BANDS[result.category];
  return NextResponse.json({
    score: result.score,
    category: result.category,
    title: band.title,
    color: band.color,
    message: band.message,
  });
}
