<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Product;
use FedaPay\WebhookSignature;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Mail\PedidoPagado;
use Illuminate\Support\Facades\Mail;


class FedaPayWebhookController extends Controller
{
    public function handle(Request $request)
    {
        //--------------- 1. Verification de la signature ----------------
        // Sans cette verification, n'importe qui pourrait envoyer
        // un faux "paiement approuve" a cette adresse.
        $contenuBrut = $request->getContent();
        $signature = $request->header('X-FEDAPAY-SIGNATURE');
        $secret = config('payments.fedapay_webhook_secret');

        if (!$signature) {
            Log::warning('Webhook FedaPay : en-tete de signature absent');
            return response()->json(['message' => 'Firma ausente.'], 400);
        }

        if (!$secret) {
            Log::error('Webhook FedaPay : FEDAPAY_WEBHOOK_SECRET est vide dans le .env');
            return response()->json(['message' => 'Configuracion incompleta.'], 500);
        }

        try {
            // 300 = on refuse un message signe il y a plus de 5 minutes
            WebhookSignature::verifyHeader($contenuBrut, $signature, $secret, 300);
        } catch (\Exception $e) {
            Log::warning('Webhook FedaPay : signature invalide : ' . $e->getMessage());
            return response()->json(['message' => 'Firma no valida.'], 400);
        }

        //--------------- 2. Lecture de l'evenement ----------------
        $evenement = json_decode($contenuBrut, true);

        if (!is_array($evenement) || !isset($evenement['name']) || !isset($evenement['entity']['id'])) {
            Log::warning('Webhook FedaPay : contenu illisible');
            return response()->json(['message' => 'Contenido no valido.'], 400);
        }

        $nom = $evenement['name'];
        $idTransaction = (string) $evenement['entity']['id'];

        Log::info('Webhook FedaPay recu : ' . $nom . ' pour la transaction ' . $idTransaction);

        //--------------- 3. On ne garde que les evenements utiles ----------------
        if ($nom !== 'transaction.approved' && $nom !== 'transaction.declined' && $nom !== 'transaction.canceled') {
            return response()->json(['message' => 'Evento ignorado.']);
        }

        // Version condensee possible :
        // if (!in_array($nom, ['transaction.approved', 'transaction.declined', 'transaction.canceled'], true)) { ... }
        // Plus courte, et on ajoute un evenement en allongeant simplement la liste.

        //--------------- 4. On retrouve notre paiement ----------------
        $paiement = Payment::where('driver', 'fedapay')->where('external_reference', $idTransaction)->first();

        if (!$paiement) {
            Log::warning('Webhook FedaPay : aucun paiement pour la transaction ' . $idTransaction);
            return response()->json(['message' => 'Pago desconocido.']);
        }

        // FedaPay peut envoyer le meme evenement plusieurs fois :
        // si le paiement a deja ete traite, on ne refait rien.
        if ($paiement->status !== 'pending') {
            return response()->json(['message' => 'Pago ya procesado.']);
        }

        $commande = $paiement->order;

        //--------------- 5. Paiement approuve ----------------
        if ($nom === 'transaction.approved') {
            // Le montant paye doit etre exactement celui enregistre
            $montantRecu = (int) $evenement['entity']['amount'];

            if ($montantRecu !== $paiement->amount) {
                Log::error('Webhook FedaPay : montant incorrect pour ' . $commande->reference
                    . ' (recu ' . $montantRecu . ', attendu ' . $paiement->amount . ')');
                return response()->json(['message' => 'Importe incorrecto.']);
            }

            $paiement->status = 'paid';
            $paiement->payload = $evenement;
            $paiement->confirmed_at = now();
            $paiement->save();

            $commande->payment_status = 'paid';
            $commande->status = 'paid';
            $commande->paid_at = now();
            $commande->save();

            Log::info('Webhook FedaPay : commande ' . $commande->reference . ' payee');

            
            // Alerte e-mail a la boutique. Si l'envoi echoue, le paiement reste enregistre.
            $destinataire = config('payments.pedidos_alerta_email');

            if ($destinataire) {
                try {
                    Mail::to($destinataire)->send(new PedidoPagado($commande));
                } catch (\Exception $e) {
                    Log::error('E-mail PedidoPagado non envoye pour ' . $commande->reference . ' : ' . $e->getMessage());
                }
            }

            return response()->json(['message' => 'Pago confirmado.']);
        }

        //--------------- 6. Paiement refuse ou annule ----------------
        $paiement->status = 'failed';
        $paiement->payload = $evenement;
        $paiement->save();

        $commande->payment_status = 'failed';
        $commande->status = 'cancelled';
        $commande->save();

        // Le stock avait ete retire a la commande : on le remet
        foreach ($commande->items as $ligne) {
            $produit = Product::find($ligne->product_id);

            if ($produit) {
                $produit->stock = $produit->stock + $ligne->quantity;
                $produit->save();
            }
        }

        Log::info('Webhook FedaPay : commande ' . $commande->reference . ' annulee (' . $nom . ')');
        return response()->json(['message' => 'Pago rechazado.']);
    }
}
