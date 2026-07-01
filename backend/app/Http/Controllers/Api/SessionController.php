<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DiningTable;
use App\Models\TableSession;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class SessionController extends Controller
{
    public function index()
    {
        return TableSession::with(['diningTable', 'payment'])
            ->where('status', 'open')->latest()->get();
    }

    public function show(TableSession $session)
    {
        $session->load(['diningTable', 'orders.items', 'payment', 'openedBy']);

        $items = $session->orders->flatMap->items;
        $subtotal = $items->sum(fn ($i) => $i->price * $i->qty);
        $tax = round($subtotal * 0.1);

        return [
            'session' => $session,
            'subtotal' => $subtotal,
            'tax' => $tax,
            'total' => $subtotal + $tax,
        ];
    }

    public function open(Request $request)
    {
        $data = $request->validate([
            'dining_table_id' => 'required|exists:dining_tables,id',
            'guest_count' => 'nullable|integer|min:1',
        ]);

        $session = TableSession::create([
            'dining_table_id' => $data['dining_table_id'],
            'opened_by' => $request->user()->id,
            'guest_count' => $data['guest_count'] ?? 2,
            'course_count' => 1,
            'status' => 'open',
            'opened_at' => Carbon::now(),
        ]);

        DiningTable::whereKey($data['dining_table_id'])->update(['status' => 'terisi']);

        return $session->load('diningTable');
    }

    public function close(TableSession $session)
    {
        $session->update(['status' => 'closed', 'closed_at' => Carbon::now()]);
        $session->diningTable->update(['status' => 'tersedia']);

        return response()->json(['message' => 'Sesi ditutup.']);
    }
}
