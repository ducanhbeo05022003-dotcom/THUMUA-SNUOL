import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getPrismaClient } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const prisma = getPrismaClient();
    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get('page');
    const company = searchParams.get('company') || undefined;

    // Backward-compatible: no `page` param -> return the full array
    // (used by the dashboard, which needs every row to compute totals/charts).
    if (!pageParam) {
      const orders = await prisma.purchaseOrder.findMany({
        include: { supplier: true, creator: true, items: true },
        orderBy: { orderDate: 'desc' },
      });
      return NextResponse.json(orders);
    }

    const page = Math.max(1, parseInt(pageParam, 10) || 1);
    const pageSize = Math.max(1, parseInt(searchParams.get('pageSize') || '10', 10));
    const where = company ? { company } : {};

    const [data, total, companyRows, totalsByCurrency] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        include: { supplier: true, creator: true, items: true },
        orderBy: { orderDate: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.purchaseOrder.count({ where }),
      prisma.purchaseOrder.findMany({ distinct: ['company'], select: { company: true } }),
      prisma.purchaseOrder.groupBy({
        by: ['currency'],
        where,
        _sum: { totalAmount: true },
      }),
    ]);

    const companies = companyRows.map((r: any) => r.company).filter(Boolean);
    const totals: Record<string, number> = {};
    totalsByCurrency.forEach((t: any) => {
      if (t.currency) totals[t.currency] = t._sum.totalAmount || 0;
    });

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      companies,
      totals,
    });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const prisma = getPrismaClient();

    let supplier = await prisma.supplier.findFirst({ where: { name: body.supplierName } });
    if (!supplier) {
      supplier = await prisma.supplier.create({
        data: {
          code: `NCC${Date.now()}`,
          name: body.supplierName,
        },
      });
    }

    const code = `PO${Date.now()}`;
    const order = await prisma.purchaseOrder.create({
      data: {
        code,
        supplierId: supplier.id,
        creatorId: user.id,
        note: body.note,
        company: body.company,
        goodsAmount: body.goodsAmount ? Number(body.goodsAmount) : undefined,
        taxAmount: body.taxAmount ? Number(body.taxAmount) : undefined,
        totalAmount: body.totalAmount ? Number(body.totalAmount) : undefined,
        currency: body.currency || 'KHR',
        categoryName: body.categoryName,
        orderDate: new Date(),
      },
      include: { supplier: true, creator: true, items: true },
    });
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi tạo đơn hàng' }, { status: 400 });
  }
}
