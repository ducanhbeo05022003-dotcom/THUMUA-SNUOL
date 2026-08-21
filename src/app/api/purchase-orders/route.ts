import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getPrismaClient } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const orders = await getPrismaClient().purchaseOrder.findMany({
      include: { supplier: true, creator: true, items: true },
      orderBy: { orderDate: 'desc' },
    });
    return NextResponse.json(orders);
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
