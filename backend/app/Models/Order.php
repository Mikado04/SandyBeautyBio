<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'reference',
        'customer_name',
        'customer_phone',
        'customer_email',
        'customer_city',
        'customer_address',
        'status',
        'payment_method',
        'payment_status',
        'total',
        'notes',
        'paid_at',
        'currency',
    ];

    protected function casts(): array
    {
        return ['total' => 'integer', 'paid_at' => 'datetime'];
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function getRouteKeyName(): string
    {
        return 'reference';
    }
}
