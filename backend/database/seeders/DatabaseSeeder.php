<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\DiningTable;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\TableSession;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ---------- USERS (semua password: "password") ----------
        $pwd = Hash::make('password');
        $users = [
            ['name' => 'Arya Dwikuncoro',            'email' => 'arya@resto.id',  'role' => 'admin',   'status' => 'aktif'],
            ['name' => 'Faiz Saddam Rafly Mulia',    'email' => 'budi@resto.id',  'role' => 'kasir',   'status' => 'aktif'],
            ['name' => 'Den Hanief Lanient Ibrahim', 'email' => 'rafly@resto.id', 'role' => 'pelayan', 'status' => 'aktif'],
            ['name' => 'Sari Dewi',                  'email' => 'sari@resto.id',  'role' => 'koki',    'status' => 'aktif'],
            ['name' => 'Niko Wijaya',                'email' => 'niko@resto.id',  'role' => 'pelayan', 'status' => 'nonaktif'],
        ];
        $U = [];
        foreach ($users as $u) {
            $U[$u['role']] = User::create($u + ['password' => $pwd]);
        }
        $pelayan = $U['pelayan'];
        $kasir = $U['kasir'];

        // ---------- CATEGORIES ----------
        $cats = [
            ['name' => 'Appetizer',    'icon' => 'appetizer', 'color' => '#1f6feb'],
            ['name' => 'Main Course',  'icon' => 'main',      'color' => '#16a34a'],
            ['name' => 'Dessert',      'icon' => 'dessert',   'color' => '#be185d'],
            ['name' => 'Minuman',      'icon' => 'drink',     'color' => '#0369a1'],
            ['name' => 'Paket Hemat',  'icon' => 'bundle',    'color' => '#b45309'],
            ['name' => 'Spesial Chef', 'icon' => 'special',   'color' => '#6b4fa0'],
        ];
        $C = [];
        foreach ($cats as $c) {
            $C[$c['name']] = Category::create($c);
        }

        // ---------- PRODUCTS ----------
        $prods = [
            ['name' => 'Nasi Goreng Seafood', 'cat' => 'Main Course', 'price' => 38000, 'stock' => 24, 'status' => 'aktif'],
            ['name' => 'Sup Iga Bakar',       'cat' => 'Main Course', 'price' => 45000, 'stock' => 12, 'status' => 'aktif'],
            ['name' => 'Ayam Geprek Sambal',  'cat' => 'Main Course', 'price' => 28000, 'stock' => 0,  'status' => 'habis'],
            ['name' => 'Salad Caesar',        'cat' => 'Appetizer',   'price' => 25000, 'stock' => 18, 'status' => 'aktif'],
            ['name' => 'Es Kopi Susu Aren',   'cat' => 'Minuman',     'price' => 20000, 'stock' => 40, 'status' => 'aktif'],
            ['name' => 'Cheesecake Lotus',    'cat' => 'Dessert',     'price' => 32000, 'stock' => 6,  'status' => 'menipis'],
        ];
        $P = [];
        foreach ($prods as $p) {
            $P[$p['name']] = Product::create([
                'category_id' => $C[$p['cat']]->id,
                'name' => $p['name'],
                'price' => $p['price'],
                'stock' => $p['stock'],
                'status' => $p['status'],
            ]);
        }

        // ---------- DINING TABLES ----------
        $tables = [
            ['number' => '01', 'area' => 'Indoor · Lt.1',   'capacity' => 4, 'status' => 'tersedia'],
            ['number' => '02', 'area' => 'Indoor · Lt.1',   'capacity' => 2, 'status' => 'terisi'],
            ['number' => '03', 'area' => 'Indoor · Lt.1',   'capacity' => 4, 'status' => 'terisi'],
            ['number' => '04', 'area' => 'Outdoor · Teras', 'capacity' => 6, 'status' => 'dipesan'],
            ['number' => '05', 'area' => 'Indoor · Lt.1',   'capacity' => 2, 'status' => 'terisi'],
            ['number' => '06', 'area' => 'Indoor · Lt.2',   'capacity' => 4, 'status' => 'tersedia'],
            ['number' => '07', 'area' => 'Indoor · Lt.1',   'capacity' => 4, 'status' => 'terisi'],
            ['number' => '08', 'area' => 'VIP Room',        'capacity' => 8, 'status' => 'terisi'],
            ['number' => '09', 'area' => 'Indoor · Lt.2',   'capacity' => 2, 'status' => 'terisi'],
            ['number' => '10', 'area' => 'Indoor · Lt.2',   'capacity' => 4, 'status' => 'tersedia'],
            ['number' => '11', 'area' => 'Outdoor · Teras', 'capacity' => 6, 'status' => 'dipesan'],
            ['number' => '12', 'area' => 'Indoor · Lt.2',   'capacity' => 4, 'status' => 'tersedia'],
        ];
        $T = [];
        foreach ($tables as $t) {
            $T[$t['number']] = DiningTable::create($t);
        }

        // ---------- SESSIONS + ORDERS + ITEMS + PAYMENTS ----------
        // helper: $items = [ [productName, qty, course, kitchenStatus], ... ]
        $makeSession = function (string $tableNo, int $guests, array $items, string $payStatus, ?string $method = null)
            use ($T, $P, $pelayan, $kasir) {
            $table = $T[$tableNo];
            $courses = max(array_map(fn ($i) => $i[2], $items));
            $session = TableSession::create([
                'dining_table_id' => $table->id,
                'opened_by' => $pelayan->id,
                'guest_count' => $guests,
                'course_count' => $courses,
                'status' => 'open',
                'opened_at' => Carbon::now()->subMinutes(rand(15, 90)),
            ]);

            $byCourse = [];
            foreach ($items as $it) {
                $byCourse[$it[2]][] = $it;
            }

            $subtotal = 0;
            foreach ($byCourse as $course => $list) {
                $order = Order::create([
                    'table_session_id' => $session->id,
                    'course' => $course,
                    'created_by' => $pelayan->id,
                ]);
                foreach ($list as $it) {
                    $product = $P[$it[0]];
                    $subtotal += $product->price * $it[1];
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $product->id,
                        'name' => $product->name,
                        'price' => $product->price,
                        'qty' => $it[1],
                        'course' => $it[2],
                        'kitchen_status' => $it[3],
                    ]);
                }
            }

            $tax = round($subtotal * 0.1);
            $total = $subtotal + $tax;
            $received = $payStatus === 'sebagian' ? round($total * 0.5) : null;
            Payment::create([
                'table_session_id' => $session->id,
                'method' => $method,
                'subtotal' => $subtotal,
                'tax' => $tax,
                'discount' => 0,
                'total' => $total,
                'amount_received' => $received,
                'change' => 0,
                'status' => $payStatus,
                'processed_by' => $payStatus === 'belum' ? null : $kasir->id,
            ]);

            return $session;
        };

        // Meja 07 — pesanan utama (muncul di Pelayan, Kasir, Dapur)
        $makeSession('07', 4, [
            ['Nasi Goreng Seafood', 2, 1, 'siap'],
            ['Es Kopi Susu Aren',   1, 1, 'diantar'],
            ['Sup Iga Bakar',       1, 2, 'antrian'],
            ['Ayam Geprek Sambal',  2, 2, 'antrian'],
        ], 'belum');

        // Dapur — Antrian
        $makeSession('03', 4, [
            ['Nasi Goreng Seafood', 1, 1, 'antrian'],
        ], 'belum');

        // Dapur — Dimasak
        $makeSession('05', 6, [
            ['Salad Caesar',      2, 1, 'dimasak'],
            ['Es Kopi Susu Aren', 2, 1, 'dimasak'],
        ], 'sebagian');

        $makeSession('09', 2, [
            ['Cheesecake Lotus', 1, 2, 'dimasak'],
        ], 'belum');

        // Dapur — Siap
        $makeSession('02', 2, [
            ['Es Kopi Susu Aren', 3, 1, 'siap'],
        ], 'belum');

        $makeSession('08', 8, [
            ['Ayam Geprek Sambal', 1, 2, 'siap'],
        ], 'belum');

        // Meja dipesan dengan tagihan terbuka
        $makeSession('11', 6, [
            ['Sup Iga Bakar',       1, 1, 'antrian'],
            ['Nasi Goreng Seafood', 1, 1, 'antrian'],
        ], 'belum');

        // ---------- RIWAYAT TRANSAKSI LUNAS (untuk Laporan Admin) ----------
        $prodList = array_values($P);
        $tableList = array_values($T);
        $methods = ['tunai', 'qris', 'debit'];
        for ($d = 6; $d >= 0; $d--) {
            $count = rand(8, 18);
            for ($n = 0; $n < $count; $n++) {
                $when = Carbon::today()->subDays($d)->setTime(rand(11, 21), rand(0, 59));
                $table = $tableList[array_rand($tableList)];
                $session = TableSession::create([
                    'dining_table_id' => $table->id,
                    'opened_by' => $pelayan->id,
                    'guest_count' => rand(1, 6),
                    'course_count' => 1,
                    'status' => 'closed',
                    'opened_at' => $when,
                    'closed_at' => (clone $when)->addMinutes(40),
                ]);
                $order = Order::create([
                    'table_session_id' => $session->id,
                    'course' => 1,
                    'created_by' => $pelayan->id,
                ]);
                $subtotal = 0;
                $picks = rand(1, 3);
                for ($k = 0; $k < $picks; $k++) {
                    $p = $prodList[array_rand($prodList)];
                    $qty = rand(1, 3);
                    $subtotal += $p->price * $qty;
                    $order->items()->create([
                        'product_id' => $p->id, 'name' => $p->name, 'price' => $p->price,
                        'qty' => $qty, 'course' => 1, 'kitchen_status' => 'diantar',
                    ]);
                }
                $tax = round($subtotal * 0.1);
                $total = $subtotal + $tax;
                Payment::create([
                    'table_session_id' => $session->id,
                    'method' => $methods[rand(0, 2)],
                    'subtotal' => $subtotal, 'tax' => $tax, 'discount' => 0, 'total' => $total,
                    'amount_received' => $total, 'change' => 0, 'status' => 'lunas',
                    'processed_by' => $kasir->id, 'paid_at' => (clone $when)->addMinutes(45),
                ]);
            }
        }
    }
}
