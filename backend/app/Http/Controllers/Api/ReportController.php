<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrderItem;
use App\Models\Payment;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function summary()
    {
        $today = Carbon::today();

        $paidToday = Payment::where('status', 'lunas')->whereDate('paid_at', $today);
        $salesToday = (float) (clone $paidToday)->sum('total');
        $txToday = (clone $paidToday)->count();

        // Penjualan 7 hari terakhir
        $chart = collect(range(6, 0))->map(function ($d) {
            $date = Carbon::today()->subDays($d);
            $sum = (float) Payment::where('status', 'lunas')
                ->whereDate('paid_at', $date)->sum('total');

            return [
                'label' => ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][$date->dayOfWeek],
                'value' => $sum,
            ];
        })->values();

        // Menu terlaris (dari seluruh item pesanan)
        $top = OrderItem::select('name', DB::raw('SUM(qty) as qty'), DB::raw('SUM(price * qty) as revenue'))
            ->groupBy('name')->orderByDesc('qty')->limit(5)->get();

        return [
            'sales_today' => $salesToday,
            'tx_today' => $txToday,
            'avg_tx' => $txToday ? round($salesToday / $txToday) : 0,
            'total_7d' => $chart->sum('value'),
            'chart' => $chart,
            'top_products' => $top,
        ];
    }
}
