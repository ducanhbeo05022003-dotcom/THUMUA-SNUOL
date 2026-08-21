import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getPrismaClient } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const prs = await getPrismaClient().purchaseRequest.findMany({
      include: { requester: true, approver: true, items: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(prs);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const code = `PR${Date.now()}`;
    const pr = await getPrismaClient().purchaseRequest.create({
      data: {
        code,
        department: body.department,
        note: body.note,
        requesterId: user.id,
        company: body.company || undefined,
        requiredTime: body.requiredTime || undefined,
        deliveryPlan: body.deliveryPlan || undefined,
        priorityLevel: body.priorityLevel ? Number(body.priorityLevel) : undefined,
        items: {
          create: body.items || [],
        },
      },
      include: { requester: true, items: true },
    });
    return NextResponse.json(pr);
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi tạo đề xuất' }, { status: 400 });
  }
}
