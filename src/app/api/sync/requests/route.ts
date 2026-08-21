import { NextResponse } from 'next/server';
import { syncPurchaseRequestsFromSheet } from '@/lib/sheetSync';

async function runSync() {
  try {
    const summary = await syncPurchaseRequestsFromSheet();
    return NextResponse.json({ success: true, ...summary });
  } catch (error: any) {
    console.error('Sheet sync error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Sync failed' }, { status: 500 });
  }
}

export async function POST() {
  return runSync();
}

export async function GET() {
  return runSync();
}
