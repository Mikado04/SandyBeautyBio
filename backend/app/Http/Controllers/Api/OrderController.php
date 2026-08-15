<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use FedaPay\FedaPay;
use FedaPay\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        //--------------- 1. Validation ----------------
        $donnees = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:50',
            'customer_email' => 'nullable|email|max:255',
            'customer_city' => 'required|string|max:255',
            'customer_address' => 'required|string',
            'notes' => 'nullable|string',
            'payment_method' => 'required|in:bank_transfer,fedapay',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer',
            'items.*.quantity' => 'required|integer|min:1|max:99',
        ]);

        $moyen = $donnees['payment_method'];

        //--------------- 2. Ce moyen de paiement est-il activé ?  ----------------
        if ($moyen === 'bank_transfer' && !config('payments.bank_transfer_enabled')) {
            return response()->json(['message' => 'Medio de pago no disponible.'], 422);
        }

        if ($moyen === 'fedapay' && !config('payments.fedapay_enabled')) {
            return response()->json(['message' => 'Medio de pago no disponible.'], 422);
        }

        // FedaPay refuse une transaction sans email
        if ($moyen === 'fedapay' && !$request->input('customer_email')) {
            return response()->json([
                'message' => 'El correo electrónico es obligatorio para pagar con FedaPay.',
            ], 422);
        }

        //--------------- 3. On recalcule TOUT depuis la base ----------------
        // On ne fait jamais confiance aux prix envoyes par le navigateur.

        $lignes = [];
        $total = 0;

        foreach ($donnees['items'] as $item) {
            $produit = Product::find($item['product_id']);

            if (!$produit) {
                return response()->json(['message' => 'Producto desconocido.'], 422);
            }

            if (!$produit->is_active) {
                return response()->json([
                    'message' => 'Producto no disponible: ' . $produit->name,
                ], 422);
            }

            if ($produit->stock < $item['quantity']) {
                return response()->json([
                    'message' => 'Stock insuficiente: ' . $produit->name,
                ], 422);
            }

            $sousTotal = $produit->price * $item['quantity'];
            $total = $total + $sousTotal;

            $lignes[] = [
                'produit' => $produit,
                'quantity' => $item['quantity'],
                'subtotal' => $sousTotal,
            ];

        }

        //--------------- 4. La devise depend du moyen de paiement ----------------
        $devise = 'XAF';

        if ($moyen === 'fedapay') {
            $devise = 'XOF';
        }

        //--------------- 5. Enregistrement de la commande ----------------
        DB::beginTransaction();

        try {
            $commande = new Order();
            $commande->customer_name = $donnees['customer_name'];
            $commande->customer_phone = $donnees['customer_phone'];
            $commande->customer_email = $request->input('customer_email');
            $commande->customer_city = $donnees['customer_city'];
            $commande->customer_address = $donnees['customer_address'];
            $commande->notes = $request->input('notes');
            $commande->payment_method = $moyen;
            $commande->payment_status = 'pending';
            $commande->status = 'pending';
            $commande->total = $total;
            $commande->currency = $devise;
            $commande->save();

            // La reference a besoin de l'id : on l'ajoute apres le premier save
            $numero = str_pad($commande->id, 4, '0', STR_PAD_LEFT);
            $commande->reference = 'SB-' . date('Y') . '-' . $numero;
            $commande->save();

            foreach ($lignes as $ligne) {
                $produit = $ligne['produit'];

                $commande->items()->create([
                    'product_id' => $produit->id,
                    'name' => $produit->name,
                    'size' => $produit->size,
                    'unit_price' => $produit->price,
                    'quantity' => $ligne['quantity'],
                    'subtotal' => $ligne['subtotal'],
                ]);

                $produit->stock = $produit->stock - $ligne['quantity'];
                $produit->save();
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error pedido : '.$e->getMessage());
            return response()->json(['message' => 'Error al registrar el pedido.'], 500);
        }

        //--------------- 6. Le paiement ----------------
        if ($moyen === 'bank_transfer') {
            $commande->payments()->create([
                'driver' => 'bank_transfer',
                'amount' => $commande->total,
                'currency' => $commande->currency,
                'status' => 'pending',
            ]);

            return response()->json([
                'reference' => $commande->reference,
                'total' => $commande->total,
                'currency' => $commande->currency,
                'payment' => [
                    'type' => 'instructions',
                    'bank' => config('payments.bank_name'),
                    'account_name' => config('payments.bank_account_name'),
                    'account' => config('payments.bank_account_number'),
                    'swift' => config('payments.bank_swift'),
                ],
            ], 201);
        }

        if ($moyen === 'fedapay') {
            FedaPay::setApiKey(config('payments.fedapay_secret_key'));
            FedaPay::setEnvironment(config('payments.fedapay_env'));

            $transaction = Transaction::create([
                'description' => 'Pedido ' . $commande->reference . ' - Sandy Beauty',
                'amount' => $commande->total,
                'currency' => ['iso' => $commande->currency],
                'callback_url' => config('payments.frontend_url') . '/pedido/' . $commande->reference,
                'customer' => [
                    'firstname' => $commande->customer_name,
                    'lastname' => $commande->customer_name,
                    'email' => $commande->customer_email,
                    'phone_number' => [
                        'number' => $commande->customer_phone,
                        'country' => 'bj',
                    ],
                ],
            ]);

            $token = $transaction->generateToken();

            $commande->payments()->create([
                'driver' => 'fedapay',
                'external_reference' => $transaction->id,
                'amount' => $commande->total,
                'currency' => $commande->currency,
                'status' => 'pending',
            ]);

            return response()->json([
                'reference' => $commande->reference,
                'total' => $commande->total,
                'currency' => $commande->currency,
                'payment' => [
                    'type' => 'redirect',
                    'url' => $token->url,
                ],
            ], 201);
        }

    }

    public function show(Order $order)
    {
        $order->load('items');

        return response()->json(['data' => $order]);
    }
}
