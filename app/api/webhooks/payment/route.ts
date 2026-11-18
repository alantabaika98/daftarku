import { NextRequest, NextResponse } from 'next/server';
import {
  settleCloudStorageOrderAction,
  settleVaInvoiceSplitAction,
} from '@/app/actions/saasHybridActions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const refId = String(
      body?.order_id || body?.external_id || body?.referenceNo || body?.id || ''
    ).trim();
    const txStatus = String(
      body?.transaction_status || body?.status || 'PAID'
    ).toUpperCase();

    if (!refId) {
      return NextResponse.json({ error: 'Referensi transaksi tidak ditemukan.' }, { status: 400 });
    }

    const isSettled = ['PAID', 'SETTLEMENT', 'CAPTURE', 'COMPLETED'].includes(txStatus);
    if (!isSettled) {
      return NextResponse.json({ received: true, ignoredStatus: txStatus });
    }

    if (refId.startsWith('CLD-')) {
      const res = await settleCloudStorageOrderAction(refId);
      return NextResponse.json(res);
    }

    const res = await settleVaInvoiceSplitAction(refId);
    return NextResponse.json(res);
  } catch (error) {
    console.error('Payment webhook error:', error);
    return NextResponse.json({ error: 'Gagal memproses webhook pembayaran.' }, { status: 500 });
  }
}