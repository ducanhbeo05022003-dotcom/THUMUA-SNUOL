import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getPrismaClient } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const contracts = await getPrismaClient().contract.findMany({
      include: { supplier: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(contracts);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
