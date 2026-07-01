<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\TableSession;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /** Pelayan: kirim pesanan (cart) ke dapur untuk satu sesi meja. */
    public function store(Request $request, TableSession $session)
    {
        $data = $request->validate([
            'course' => 'nullable|integer|min:1',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.qty' => 'required|integer|min:1',
        ]);

        $course = $data['course'] ?? max(1, $session->course_count);

        $order = Order::create([
            'table_session_id' => $session->id,
            'course' => $course,
            'created_by' => $request->user()->id,
        ]);

        foreach ($data['items'] as $it) {
            $product = Product::find($it['product_id']);
            $order->items()->create([
                'product_id' => $product->id,
                'name' => $product->name,
                'price' => $product->price,
                'qty' => $it['qty'],
                'course' => $course,
                'kitchen_status' => 'antrian',
            ]);
        }

        return $order->load('items');
    }

    /** Koki: daftar item yang masih perlu ditangani (papan dapur). */
    public function kitchen()
    {
        return OrderItem::whereIn('kitchen_status', ['antrian', 'dimasak', 'siap'])
            ->whereHas('order.session', fn ($q) => $q->where('status', 'open'))
            ->with('order.session.diningTable')
            ->orderBy('created_at')
            ->get()
            ->map(fn (OrderItem $i) => [
                'id' => $i->id,
                'name' => $i->name,
                'qty' => $i->qty,
                'course' => $i->course,
                'status' => $i->kitchen_status,
                'table' => optional($i->order->session->diningTable)->number,
                'time' => optional($i->order->created_at)->format('H:i'),
            ]);
    }

    /** Koki: ubah status dapur sebuah item. */
    public function updateItemStatus(Request $request, OrderItem $item)
    {
        $data = $request->validate([
            'status' => 'required|in:antrian,dimasak,siap,diantar',
        ]);

        $item->update(['kitchen_status' => $data['status']]);

        return $item;
    }
}
