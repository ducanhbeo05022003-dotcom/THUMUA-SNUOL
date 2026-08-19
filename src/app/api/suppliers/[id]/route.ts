import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const body = await request.json();

    const supplier = await prisma.supplier.update({
      where: { id },
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
    return NextResponse.json({ error: 'Lỗi cập nhật' }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    await prisma.supplier.update({
      where: { id },
      data: { active: false },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi xóa' }, { status: 400 });
  }
}
