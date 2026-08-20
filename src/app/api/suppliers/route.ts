import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getPrismaClient } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const suppliers = await getPrismaClient().supplier.findMany({
      where: { active: true },
      orderBy: { code: 'asc' },
    });
    return NextResponse.json(suppliers);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();
    const supplier = await getPrismaClient().supplier.create({
      data: {
        code: body.code,
        name: body.name,
        taxCode: body.taxCode || null,
        contactName: body.contactName || null,
        phone: body.phone || null,
        email: body.email || null,
        address: body.address || null,
        bankAccount: body.bankAccount || null,
        notes: body.notes || null,
      },
    });
    return NextResponse.json(supplier);
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi tạo nhà cung cấp' }, { status: 400 });
  }
}
