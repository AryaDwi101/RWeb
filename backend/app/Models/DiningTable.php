<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DiningTable extends Model
{
    protected $table = 'dining_tables';

    protected $fillable = ['number', 'area', 'capacity', 'status'];

    public function sessions(): HasMany
    {
        return $this->hasMany(TableSession::class);
    }

    public function openSession()
    {
        return $this->hasOne(TableSession::class)->where('status', 'open')->latestOfMany();
    }
}
