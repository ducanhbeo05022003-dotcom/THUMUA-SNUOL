import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

const SESSION_COOKIE = 'qlmh_session';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (token) {
      await prisma.session.delete({ where: { token } }).catch(() => {});
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete(SESSION_COOKIE);
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi đăng xuất' },
      { status: 500 }
    );
  }
}
