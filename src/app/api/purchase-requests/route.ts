import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getPrismaClient } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const prisma = getPrismaClient();
    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get('page');

    // Backward-compatible: no `page` param -> return the full array
    // (used by the dashboard, which needs every row to compute totals/charts).
    if (!pageParam) {
      const prs = await prisma.purchaseRequest.findMany({
        include: { requester: true, approver: true, items: true },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(prs);
    }

    const page = Math.max(1, parseInt(pageParam, 10) || 1);
    const pageSize = Math.max(1, parseInt(searchParams.get('pageSize') || '10', 10));

    const [data, total] = await Promise.all([
      prisma.purchaseRequest.findMany({
        include: { requester: true, approver: true, items: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.purchaseRequest.count(),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    });
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
