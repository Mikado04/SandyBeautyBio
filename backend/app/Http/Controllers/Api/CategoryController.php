<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;

class CategoryController extends Controller
{
    public function index(){

        $categories = Category::orderBy('position')->get();

        foreach($categories as $categorie){
            $categorie->products_count = $categorie->products()
            ->where('is_active', true)
            ->count();
        }
        return CategoryResource::collection($categories);
    }
}
