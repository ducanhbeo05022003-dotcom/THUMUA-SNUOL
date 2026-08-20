import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getPrismaClient } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const body = await request.json();

    const material = await getPrismaClient().material.update({
      where: { id },
      data: {
        name: body.name,
        unit: body.unit,
        category: body.category,
        stage: body.stage || null,
        techSpec: body.techSpec || null,
        norm: body.norm || null,
        normUnit: body.normUnit || null,
      },
    });
    return NextResponse.json(material);
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
    await getPrismaClient().material.update({
      where: { id },
      data: { active: false },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi xóa' }, { status: 400 });
  }
}
