<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminProductController extends Controller
{
    // Liste complete, y compris les produits desactives
    public function index()
    {
        $produits = Product::with('category')->orderBy('name')->get();

        return ProductResource::collection($produits);
    }

    public function store(Request $request)
    {
        $donnees = $request->validate([
            'name'        => 'required|string|max:255',
            'category_id' => 'required|integer|exists:categories,id',
            'description' => 'nullable|string',
            'size'        => 'nullable|string|max:50',
            'price'       => 'required|integer|min:0',
            'stock'       => 'required|integer|min:0',
            'highlight'   => 'nullable|string|max:50',
            'is_active'   => 'required|boolean',
            'image'       => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $slug = Str::slug($donnees['name']);

        $existe = Product::where('slug', $slug)->first();

        if ($existe) {
            return response()->json(['message' => 'Ya existe un producto con ese nombre.'], 422);
        }

        $produit = new Product();
        $produit->category_id = $donnees['category_id'];
        $produit->name        = $donnees['name'];
        $produit->slug        = $slug;
        $produit->description = $request->input('description');
        $produit->size        = $request->input('size');
        $produit->price       = $donnees['price'];
        $produit->stock       = $donnees['stock'];
        $produit->highlight   = $request->input('highlight');
        $produit->is_active   = $donnees['is_active'];
        $produit->save();

        // La photo, si elle a ete envoyee
        if ($request->hasFile('image')) {
            $fichier = $request->file('image');
            $nom = $slug.'.'.$fichier->getClientOriginalExtension();
            $fichier->move(public_path('images/products'), $nom);

            $produit->image_path = 'images/products/'.$nom;
            $produit->save();
        }

        $produit->load('category');

        return ProductResource::make($produit);
    }

    public function update(Request $request, $id)
    {
        $produit = Product::find($id);

        if (! $produit) {
            return response()->json(['message' => 'Producto no encontrado.'], 404);
        }

        $donnees = $request->validate([
            'name'        => 'required|string|max:255',
            'category_id' => 'required|integer|exists:categories,id',
            'description' => 'nullable|string',
            'size'        => 'nullable|string|max:50',
            'price'       => 'required|integer|min:0',
            'stock'       => 'required|integer|min:0',
            'highlight'   => 'nullable|string|max:50',
            'is_active'   => 'required|boolean',
            'image'       => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $slug = Str::slug($donnees['name']);

        // Un autre produit porte-t-il deja ce slug ?
        $existe = Product::where('slug', $slug)->where('id', '!=', $produit->id)->first();

        if ($existe) {
            return response()->json(['message' => 'Ya existe un producto con ese nombre.'], 422);
        }

        $produit->category_id = $donnees['category_id'];
        $produit->name        = $donnees['name'];
        $produit->slug        = $slug;
        $produit->description = $request->input('description');
        $produit->size        = $request->input('size');
        $produit->price       = $donnees['price'];
        $produit->stock       = $donnees['stock'];
        $produit->highlight   = $request->input('highlight');
        $produit->is_active   = $donnees['is_active'];
        $produit->save();

        if ($request->hasFile('image')) {
            // On efface l'ancienne photo pour ne pas laisser de fichiers orphelins
            if ($produit->image_path && file_exists(public_path($produit->image_path))) {
                unlink(public_path($produit->image_path));
            }

            $fichier = $request->file('image');
            $nom = $slug.'.'.$fichier->getClientOriginalExtension();
            $fichier->move(public_path('images/products'), $nom);

            $produit->image_path = 'images/products/'.$nom;
            $produit->save();
        }

        $produit->load('category');

        return ProductResource::make($produit);
    }

    public function destroy($id)
    {
        $produit = Product::find($id);

        if (! $produit) {
            return response()->json(['message' => 'Producto no encontrado.'], 404);
        }

        // Un produit deja commande ne doit pas disparaitre : on le desactive
        $dejaCommande = OrderItem::where('product_id', $produit->id)->first();

        if ($dejaCommande) {
            $produit->is_active = false;
            $produit->save();

            return response()->json(['message' => 'Producto desactivado (tiene pedidos).']);
        }

        if ($produit->image_path && file_exists(public_path($produit->image_path))) {
            unlink(public_path($produit->image_path));
        }

        $produit->delete();

        return response()->json(['message' => 'Producto eliminado.']);
    }
}
