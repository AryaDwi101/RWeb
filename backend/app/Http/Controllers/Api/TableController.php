<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DiningTable;
use Illuminate\Http\Request;

class TableController extends Controller
{
    public function index()
    {
        return DiningTable::with('openSession')->orderBy('number')->get()
            ->map(fn (DiningTable $t) => [
                'id' => $t->id,
                'number' => $t->number,
                'area' => $t->area,
                'capacity' => $t->capacity,
                'status' => $t->status,
                'open_session_id' => optional($t->openSession)->id,
            ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);

        return DiningTable::create($data);
    }

    public function update(Request $request, DiningTable $table)
    {
        $data = $this->validateData($request);
        $table->update($data);

        return $table;
    }

    public function destroy(DiningTable $table)
    {
        $table->delete();

        return response()->json(['message' => 'Meja dihapus.']);
    }

    private function validateData(Request $request): array
    {
        return $request->validate([
            'number' => 'required|string|max:20',
            'area' => 'nullable|string|max:100',
            'capacity' => 'required|integer|min:1',
            'status' => 'required|in:tersedia,terisi,dipesan',
        ]);
    }
}
