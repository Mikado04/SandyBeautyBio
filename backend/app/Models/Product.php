<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{

    use HasFactory;
    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'size',
        'price',
        'stock',
        'highlight',
        'image_path',
        'is_active',
        'gama',
    ];

    public function casts()
    {

        return [
            'price' => 'integer',
            'stock' => 'integer',
            'is_active' => 'boolean',
            ];
            
    }

    public function category(){
        return $this->belongsTo(Category::class);
    }

    // Pour le referencement fourni les url sans les id
    public function getRouteKeyName()
    {
        return 'slug';
    }
}
