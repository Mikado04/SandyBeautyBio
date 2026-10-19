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
use App\Mail\PedidoPagado;
use Illuminate\Support\Facades\Mail;

use function Illuminate\Support\now;

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
            'payment_method' => 'required|in:bank_transfer,fedapay,kkiapay',
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

        
        if ($moyen === 'kkiapay' && !config('payments.kkiapay_enabled')) {
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

        
        if ($moyen === 'kkiapay') {
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
            Log::error('Error pedido : ' . $e->getMessage());
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

            // On essaie de creer la transaction chez FedaPay.
            // Si FedaPay refuse ou ne repond pas, on passe directement dans le catch.
            try {
                $transaction = Transaction::create([
                    'description' => 'Pedido ' . $commande->reference . ' - Sandy Beauty',
                    'amount' => $commande->total,
                    'currency' => ['iso' => $commande->currency],
                    // Le front est une page unique : la reference passe en parametre (?pedido=...)
                    'callback_url' => config('payments.frontend_url') . '/?pedido=' . $commande->reference,

                    // Pas de telephone : FedaPay refuse les numeros qui ne respectent pas
                    // le format du pays (ex. 9 chiffres pour le Benin). Le client saisit
                    // de toute facon son numero Mobile Money sur la page FedaPay.
                    'customer' => [
                        'firstname' => $commande->customer_name,
                        'lastname' => $commande->customer_name,
                        'email' => $commande->customer_email,
                    ],

                ]);

                $token = $transaction->generateToken();
            } catch (\Exception $e) {
                // On garde la vraie raison dans storage/logs/laravel.log
                // FedaPay range le detail des refus dans getErrors(),
                // par ex. {"phone_number.number":["n'est pas valide"]}
                $details = '';

                if (method_exists($e, 'getErrors')) {
                    $details = ' ' . json_encode($e->getErrors(), JSON_UNESCAPED_UNICODE);
                }

                Log::error('Error FedaPay pedido ' . $commande->reference . ' : ' . $e->getMessage() . $details);


                // La commande est deja enregistree : on l'annule au lieu de la supprimer
                $commande->status = 'cancelled';
                $commande->payment_status = 'failed';
                $commande->save();

                // Le stock a deja ete retire : on le remet, ligne par ligne
                foreach ($commande->items as $ligne) {
                    $produit = Product::find($ligne->product_id);

                    if ($produit) {
                        $produit->stock = $produit->stock + $ligne->quantity;
                        $produit->save();
                    }
                }

                // Version condensee possible :
                // $commande->items->each(fn ($ligne) => Product::whereKey($ligne->product_id)->increment('stock', $ligne->quantity));
                // Plus courte, et increment() fait l'ajout directement en SQL (stock = stock + n),
                // ce qui evite qu'une autre commande simultanee ecrase la valeur.

                return response()->json([
                    'message' => 'No se pudo iniciar el pago. Inténtalo de nuevo más tarde.',
                ], 502);
            }

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

        
        if ($moyen === 'kkiapay') {
            // Le numero de transaction Kkiapay n'existe qu'apres le paiement :
            // external_reference reste vide, il sera rempli a la confirmation.
            $commande->payments()->create([
                'driver' => 'kkiapay',
                'amount' => $commande->total,
                'currency' => $commande->currency,
                'status' => 'pending',
            ]);

            // Tout ce qu'il faut au front pour ouvrir la fenetre Kkiapay.
            // La cle PUBLIQUE est faite pour etre vue par le navigateur ;
            // la cle privee et le secret ne quittent jamais le serveur.
            return response()->json([
                'reference' => $commande->reference,
                'total' => $commande->total,
                'currency' => $commande->currency,
                'payment' => [
                    'type' => 'widget',
                    'public_key' => config('payments.kkiapay_public_key'),
                    'sandbox' => (bool) config('payments.kkiapay_sandbox'),
                    'amount' => $commande->total,
                    'name' => $commande->customer_name,
                    'email' => $commande->customer_email,
                ],
            ], 201);
        }

    }

    public function show(Order $order)
    {
        //--------------- 1. Faut-il verifier aupres de FedaPay ? ----------------
        // Si la commande FedaPay est encore en attente, on demande le vrai statut
        // a FedaPay : utile si le webhook s'est perdu ou n'est pas encore arrive.
        // On ne se fie JAMAIS au "status=approved" de l'adresse de retour :
        // n'importe qui peut le taper a la main.
        if ($order->payment_method === 'fedapay' && $order->payment_status === 'pending') {

            //--------------- 2. Le paiement en attente ----------------
            $paiement = $order->payments()->where('driver', 'fedapay')->where('status', 'pending')->first();

            if ($paiement && $paiement->external_reference) {

                //--------------- 3. On interroge FedaPay ----------------
                $statutFedaPay = null;
                $montantFedaPay = 0;

                try {
                    FedaPay::setApiKey(config('payments.fedapay_secret_key'));
                    FedaPay::setEnvironment(config('payments.fedapay_env'));

                    $transaction = Transaction::retrieve($paiement->external_reference);
                    $statutFedaPay = $transaction->status;
                    $montantFedaPay = (int) $transaction->amount;
                } catch (\Exception $e) {
                    // FedaPay ne repond pas : on affiche la commande telle quelle
                    Log::warning('Verification FedaPay impossible pour ' . $order->reference . ' : ' . $e->getMessage());
                }

                //--------------- 4. Paiement approuve ----------------
                // "transferred" = paye, puis argent verse au marchand : c'est aussi un paiement reussi
                if ($statutFedaPay === 'approved' || $statutFedaPay === 'transferred') {
                    if ($montantFedaPay === $paiement->amount) {
                        $paiement->status = 'paid';
                        $paiement->confirmed_at = now();
                        $paiement->save();

                        $order->payment_status = 'paid';
                        $order->status = 'paid';
                        $order->paid_at = now();
                        $order->save();

                        Log::info('Verification FedaPay : commande ' . $order->reference . ' payee');

                        
                        // Alerte e-mail a la boutique. Si l'envoi echoue, le paiement reste enregistre.
                        $destinataire = config('payments.pedidos_alerta_email');

                        if ($destinataire) {
                            try {
                                Mail::to($destinataire)->send(new PedidoPagado($order));
                            } catch (\Exception $e) {
                                Log::error('E-mail PedidoPagado non envoye pour ' . $order->reference . ' : ' . $e->getMessage());
                            }
                        }

                    } else {
                        Log::error('Verification FedaPay : montant incorrect pour ' . $order->reference
                            . ' (FedaPay ' . $montantFedaPay . ', attendu ' . $paiement->amount . ')');
                    }
                }

                //--------------- 5. Paiement refuse ou annule ----------------
                if ($statutFedaPay === 'declined' || $statutFedaPay === 'canceled') {
                    $paiement->status = 'failed';
                    $paiement->save();

                    $order->payment_status = 'failed';
                    $order->status = 'cancelled';
                    $order->save();

                    foreach ($order->items as $ligne) {
                        $produit = Product::find($ligne->product_id);

                        if ($produit) {
                            $produit->stock = $produit->stock + $ligne->quantity;
                            $produit->save();
                        }
                    }

                    Log::info('Verification FedaPay : commande ' . $order->reference . ' annulee (' . $statutFedaPay . ')');
                }

                // Version condensee possible pour le test du point 4 :
                // if (in_array($statutFedaPay, ['approved', 'transferred'], true)) { ... }
                // Plus courte quand la liste des statuts acceptes s'allonge.
            }
        }

        //--------------- 6. La reponse : aucune donnee personnelle ----------------
        // Cette adresse est publique et les references se devinent
        // (SB-2026-0001, 0002...) : on ne renvoie que ce que la page de retour affiche.
        return response()->json([
            'data' => [
                'reference' => $order->reference,
                'status' => $order->status,
                'payment_status' => $order->payment_status,
                'payment_method' => $order->payment_method,
                'total' => $order->total,
                'currency' => $order->currency,
            ],
        ]);
    }


}
