import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from "@/lib/prisma";
import { createSession, verifyPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Tên đăng nhập và mật khẩu bắt buộc' },
        { status: 400 }
      );
    }

    const user = await getPrismaClient().user.findUnique({
      where: { username },
    });

    if (!user || !user.active) {
      return NextResponse.json(
        { error: 'Tên đăng nhập hoặc mật khẩu sai' },
        { status: 401 }
      );
    }

    const passwordValid = await verifyPassword(password, user.passwordHash);
    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Tên đăng nhập hoặc mật khẩu sai' },
        { status: 401 }
      );
    }

    await createSession(user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    );
  }
}
