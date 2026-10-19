<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // On renvoie une URL complete : React n'a rien a reconstruire
                $imageUrl = null;

        if ($this->image_path) {
            // Le fichier garde le meme nom a chaque remplacement. On ajoute donc
            // la date de derniere modification a l'adresse : elle change, et le
            // navigateur redemande la photo au lieu de servir celle de son cache.
            $imageUrl = url($this->image_path).'?v='.$this->updated_at->timestamp;
        }


        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'size' => $this->size,
            'price' => $this->price,
            'stock' => $this->stock,
            'in_stock' => $this->stock > 0,
            'highlight' => $this->highlight,
            'image_url' => $imageUrl,
            'is_active' => $this->is_active,
            'category' => new CategoryResource($this->category),
            'gama' => $this->gama,
        ];
    }
}
