<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->string('name');                 // snapshot nama produk
            $table->decimal('price', 12, 2)->default(0);
            $table->integer('qty')->default(1);
            $table->integer('course')->default(1);
            $table->enum('kitchen_status', ['antrian', 'dimasak', 'siap', 'diantar'])->default('antrian');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
