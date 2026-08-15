<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request){

        $requete = Product::with('category')->where('is_active', true);
        $slugCategorie = $request->query('category');

        if($slugCategorie){
            $categorie = Category::where('slug', $slugCategorie)->first();

            if(!$categorie){
                abort(404, 'Categoria desconocida.');
            }

            $requete->where('category_id', $categorie->id);
        }

        $recherche = $request->query('search');
        if($recherche){
            $requete->where('name', 'like', '%'.$recherche.'%');
        }

        $requete->orderBy('name');

        return ProductResource::collection($requete->paginate(12));
    }

    public function show(Product $product){
        if(!$product->is_active){
            abort(404);
        }

        $product->load('category');
        
        return ProductResource::make($product);

    }
}
