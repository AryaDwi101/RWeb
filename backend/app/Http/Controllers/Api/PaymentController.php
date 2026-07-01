<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\TableSession;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class PaymentController extends Controller
{
    /** Kasir: daftar tagihan (sesi meja yang masih terbuka) + ringkasan. */
    public function bills()
    {
        $sessions = TableSession::where('status', 'open')
            ->with(['diningTable', 'payment', 'orders.items'])
            ->get()
            ->map(function (TableSession $s) {
                $items = $s->orders->flatMap->items;
                $subtotal = $items->sum(fn ($i) => $i->price * $i->qty);
                $tax = round($subtotal * 0.1);

                return [
                    'session_id' => $s->id,
                    'table' => $s->diningTable->number,
                    'guest_count' => $s->guest_count,
                    'opened_at' => optional($s->opened_at)->format('H:i'),
                    'item_count' => $items->sum('qty'),
                    'subtotal' => $subtotal,
                    'tax' => $tax,
                    'total' => $subtotal + $tax,
                    'status' => optional($s->payment)->status ?? 'belum',
                ];
            })->values();

        return [
            'stats' => [
                'active' => $sessions->count(),
                'unpaid_total' => $sessions->sum('total'),
                'done_today' => Payment::where('status', 'lunas')
                    ->whereDate('paid_at', Carbon::today())->count(),
            ],
            'bills' => $sessions,
        ];
    }

    /** Kasir: proses pembayaran sebuah sesi → lunas, tutup sesi, bebaskan meja. */
    public function pay(Request $request, TableSession $session)
    {
        $data = $request->validate([
            'method' => 'required|in:tunai,qris,debit',
            'amount_received' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
        ]);

        $session->load('orders.items', 'diningTable');
        $items = $session->orders->flatMap->items;
        $subtotal = $items->sum(fn ($i) => $i->price * $i->qty);
        $tax = round($subtotal * 0.1);
        $discount = $data['discount'] ?? 0;
        $total = max(0, $subtotal + $tax - $discount);
        $received = $data['amount_received'] ?? $total;
        $change = max(0, $received - $total);

        $payment = Payment::updateOrCreate(
            ['table_session_id' => $session->id],
            [
                'method' => $data['method'],
                'subtotal' => $subtotal,
                'tax' => $tax,
                'discount' => $discount,
                'total' => $total,
                'amount_received' => $received,
                'change' => $change,
                'status' => 'lunas',
                'processed_by' => $request->user()->id,
                'paid_at' => Carbon::now(),
            ]
        );

        $session->update(['status' => 'closed', 'closed_at' => Carbon::now()]);
        $session->diningTable->update(['status' => 'tersedia']);

        return [
            'payment' => $payment,
            'table' => $session->diningTable->number,
            'items' => $items->map(fn ($i) => [
                'name' => $i->name, 'qty' => $i->qty, 'price' => $i->price,
            ])->values(),
        ];
    }
}
