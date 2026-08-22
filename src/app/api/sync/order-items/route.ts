import { NextResponse } from 'next/server';
import { syncOrderItemsFromSheet } from '@/lib/sheetSync';

async function runSync() {
  try {
    const summary = await syncOrderItemsFromSheet();
    return NextResponse.json({ success: true, ...summary });
  } catch (error: any) {
    console.error('Order items sheet sync error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Sync failed' }, { status: 500 });
  }
}

export async function POST() {
  return runSync();
}

export async function GET() {
  return runSync();
}
