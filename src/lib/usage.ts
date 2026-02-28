import prisma from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

const FREE_POINTS = 5;
const PRO_POINTS = 100;
const GENERATION_COST = 1;
const DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in ms

export async function consumeCredits() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not Authenticated");
  }

  const { has } = await auth();
  const hasProAccess = has({ plan: "pro" });
  const maxPoints = hasProAccess ? PRO_POINTS : FREE_POINTS;
  const now = new Date();

  let record = await prisma.rateLimit.findUnique({ where: { key: userId } });

  if (!record || record.expire.getTime() < now.getTime()) {
    record = await prisma.rateLimit.upsert({
      where: { key: userId },
      update: {
        points: GENERATION_COST,
        expire: new Date(now.getTime() + DURATION),
      },
      create: {
        key: userId,
        points: GENERATION_COST,
        expire: new Date(now.getTime() + DURATION),
      },
    });
  } else {
    if (record.points + GENERATION_COST > maxPoints) {
      throw { code: "TOO_MANY_REQUESTS" };
    }

    record = await prisma.rateLimit.update({
      where: { key: userId },
      data: {
        points: { increment: GENERATION_COST },
      },
    });
  }

  return record;
}

export async function getUsageStatus() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not Authenticated");
  }

  const { has } = await auth();
  const hasProAccess = has({ plan: "pro" });
  const maxPoints = hasProAccess ? PRO_POINTS : FREE_POINTS;
  const now = new Date();

  const record = await prisma.rateLimit.findUnique({ where: { key: userId } });

  if (!record || record.expire.getTime() < now.getTime()) {
    return {
      remainingPoints: maxPoints,
      msBeforeNext: -1,
    };
  }

  return {
    remainingPoints: Math.max(0, maxPoints - record.points),
    msBeforeNext: Math.max(0, record.expire.getTime() - now.getTime()),
  };
}
