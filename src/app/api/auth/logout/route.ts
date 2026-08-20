import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getPrismaClient } from "@/lib/prisma";

const SESSION_COOKIE = 'qlmh_session';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (token) {
      await getPrismaClient().session.delete({ where: { token } }).catch(() => {});
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
