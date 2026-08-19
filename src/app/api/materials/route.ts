import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const materials = await prisma.material.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(materials);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();
    const material = await prisma.material.create({
      data: {
        name: body.name,
        unit: body.unit,
        category: body.category || 'Khác',
        stage: body.stage || null,
        techSpec: body.techSpec || null,
        norm: body.norm || null,
        normUnit: body.normUnit || null,
      },
    });
    return NextResponse.json(material);
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi tạo vật tư' }, { status: 400 });
  }
}
