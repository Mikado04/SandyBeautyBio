<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CatalogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = ['Rostro', 'Cuerpo', 'Higiene', 'Aromas & Bienestar', 'Labios'];

        foreach ($categories as $index =>$name){
            Category::updateOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name, 'position' => $index +1],
            );
        }

        $categoryIds = Category::pluck('id', 'slug');

        $products = [
           ['Gel de Ducha',        '500ml', 'Limpieza suave con aloe y tola',          7500,  'Cuerpo',             null,                   24],
            ['Gel Facial',          '150ml', 'Purifica sin resecar',                    8000,  'Rostro',             'Best-seller',          18],
            ['Gel Íntimo',          '200ml', 'pH equilibrado, moringa',                 6500,  'Higiene',            null,                   32],
            ['Gel de Manos',        '250ml', 'Antibacteriano hidratante',               4500,  'Higiene',            null,                   40],
            ['Crema Facial',        '50ml',  'Nutrición intensa día/noche',             12000, 'Rostro',             'Nuevo',                12],
            ['Crema Corporal',      '250ml', 'Karité de Bioko',                         10000, 'Cuerpo',             null,                   20],
            ['Crema Manos',         '75ml',  'Reparadora',                              5000,  'Cuerpo',             null,                   28],
            ['Exfoliante Corporal', '200g',  'Tola y azúcar',                           9000,  'Cuerpo',             null,                   15],
            ['Serum Facial',        '30ml',  'Ácido hialurónico vegetal',               15000, 'Rostro',             'Alta concentración',   10],
            ['Serum Corporal',      '100ml', 'Aceites Esenciales Iluminador',           14000, 'Cuerpo',             null,                   14],
            ['Fragancia / Perfume', '50ml',  'Esencia de Bioko - Extractos Aromáticos', 18000, 'Aromas & Bienestar', 'Edición Bioko',        8],
            ['Jabón Corporal',      '150g',  'Artesanal cold-pressed',                  3500,  'Higiene',            null,                   50],
            ['Aceite de Masajes',   '200ml', 'Relajante ylang-ylang',                   11000, 'Aromas & Bienestar', null,                   16],
            ['Agua Micelar',        '250ml', 'Desmaquillante natural',                  7000,  'Rostro',             null,                   22],
            ['Vela Aromática',      '180g',  'Vidrio transparente - Soja y esencias',   8500,  'Aromas & Bienestar', null,                   19],
            ['Especias en Polvo',   '80g',   'Ritual baño purificante',                 4000,  'Aromas & Bienestar', null,                   30],
            ['Sal de Baño',         '300g',  'Himalaya rosa + anís de Bioko',           6000,  'Aromas & Bienestar', null,                   26],
            ['Bombas de Baño',      '3x90g', 'Efervescentes naturales',                 7500,  'Aromas & Bienestar', null,                   21],
            ['Labial Protectivo',   '5g',    'Karité y cacao ecuatoguineano',           3000,  'Labios',             null,                   45],
            ['Bruma Facial',        '100ml', 'Refrescante tola',                        6000,  'Rostro',             null,                   25],
        ];

        foreach($products as [$name, $size, $description, $price, $category, $highlight, $stock]){
            Product::updateOrCreate(
                ['slug' => Str::slug($name)],
                [
                     'category_id' => $categoryIds[Str::slug($category)],
                    'name'        => $name,
                    'size'        => $size,
                    'description' => $description,
                    'price'       => $price,
                    'stock'       => $stock,
                    'highlight'   => $highlight,
                ],
            );
        }

    }
}
