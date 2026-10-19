<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Mail\PedidoPagado;
use Illuminate\Support\Facades\Mail;

use function Illuminate\Support\now;

class KkiapayController extends Controller
{
    // Appelee par le front juste apres le paiement dans la fenetre Kkiapay.
    // Le front envoie le numero de transaction. On ne le croit pas sur parole :
    // on demande a Kkiapay le statut et le montant reels de cette transaction.
    public function confirmar(Request $request, Order $order)
    {
        //--------------- 1. Validation ----------------
        $donnees = $request->validate([
            'transaction_id' => 'required|string|max:100',
        ]);

        $idTransaction = $donnees['transaction_id'];

        //--------------- 2. La commande ----------------
        if ($order->payment_method !== 'kkiapay') {
            return response()->json(['message' => 'Este pedido no se paga con Kkiapay.'], 422);
        }

        // Deja payee : on renvoie simplement son etat (le front peut rappeler sans danger)
        if ($order->payment_status === 'paid') {
            return $this->reponseCommande($order);
        }

        //--------------- 3. Transaction deja utilisee ailleurs ? ----------------
        // Fraude classique : payer une fois, puis envoyer le meme numero pour une autre commande.
        $dejaUtilisee = Payment::where('driver', 'kkiapay')
            ->where('external_reference', $idTransaction)
            ->where('order_id', '!=', $order->id)
            ->exists();

        if ($dejaUtilisee) {
            Log::warning('Kkiapay : transaction ' . $idTransaction . ' deja utilisee, refusee pour ' . $order->reference);
            return response()->json(['message' => 'Esta transacción ya se ha utilizado.'], 422);
        }

        //--------------- 4. On demande a Kkiapay ----------------
        $transaction = $this->verifierTransaction($idTransaction);

        if ($transaction === null) {
            return response()->json(['message' => 'No se pudo comprobar el pago. Inténtalo de nuevo.'], 502);
        }

        //--------------- 5. Statut et montant ----------------
        $statut = '';

        if (isset($transaction['status'])) {
            $statut = $transaction['status'];
        }

        if ($statut !== 'SUCCESS') {
            Log::info('Kkiapay : transaction ' . $idTransaction . ' non reussie pour ' . $order->reference . ' (' . $statut . ')');
            return response()->json(['message' => 'El pago no se ha confirmado.'], 422);
        }

        $montantPaye = 0;

        if (isset($transaction['amount'])) {
            $montantPaye = (int) $transaction['amount'];
        }

        if ($montantPaye !== $order->total) {
            Log::error('Kkiapay : montant incorrect pour ' . $order->reference
                . ' (paye ' . $montantPaye . ', attendu ' . $order->total . ')');
            return response()->json(['message' => 'El importe pagado no corresponde al pedido.'], 422);
        }

        // Si Kkiapay renvoie la reference transmise par le front (partnerId), elle doit correspondre
        if (!empty($transaction['partnerId']) && $transaction['partnerId'] !== $order->reference) {
            Log::error('Kkiapay : transaction ' . $idTransaction . ' liee a ' . $transaction['partnerId']
                . ', refusee pour ' . $order->reference);
            return response()->json(['message' => 'Esta transacción pertenece a otro pedido.'], 422);
        }

        //--------------- 6. La commande est payee ----------------
        $paiement = $order->payments()->where('driver', 'kkiapay')->where('status', 'pending')->first();

        // Normalement cree par store() ; on le cree au besoin pour ne jamais perdre un paiement
        if (!$paiement) {
            $paiement = new Payment();
            $paiement->order_id = $order->id;
            $paiement->driver = 'kkiapay';
            $paiement->amount = $order->total;
            $paiement->currency = $order->currency;
        }

        $paiement->external_reference = $idTransaction;
        $paiement->status = 'paid';
        $paiement->payload = $transaction;
        $paiement->confirmed_at = now();
        $paiement->save();

        $order->payment_status = 'paid';
        $order->status = 'paid';
        $order->paid_at = now();
        $order->save();

        Log::info('Kkiapay : commande ' . $order->reference . ' payee (transaction ' . $idTransaction . ')');

        
        // Alerte e-mail a la boutique. Si l'envoi echoue, le paiement reste enregistre.
        $destinataire = config('payments.pedidos_alerta_email');

        if ($destinataire) {
            try {
                Mail::to($destinataire)->send(new PedidoPagado($order));
            } catch (\Exception $e) {
                Log::error('E-mail PedidoPagado non envoye pour ' . $order->reference . ' : ' . $e->getMessage());
            }
        }


        return $this->reponseCommande($order);
    }

    
    // Kkiapay previent ici quand une transaction reussit ou echoue,
    // meme si le client a ferme son navigateur avant de revenir sur le site.
    public function webhook(Request $request)
    {
        //--------------- 1. L'appel vient-il vraiment de Kkiapay ? ----------------
        // Kkiapay renvoie dans cet en-tete le secret choisi dans son tableau de bord.
        $secretRecu = (string) $request->header('x-kkiapay-secret');
        $secretAttendu = (string) config('payments.kkiapay_webhook_secret');

        if ($secretAttendu === '') {
            Log::error('Webhook Kkiapay : KKIAPAY_WEBHOOK_SECRET est vide dans le .env');
            return response()->json(['message' => 'Configuracion incompleta.'], 500);
        }

        // hash_equals compare en temps constant : on ne peut pas deviner le secret
        // en mesurant la duree des reponses, comme avec une comparaison ===
        if (!hash_equals($secretAttendu, $secretRecu)) {
            Log::warning('Webhook Kkiapay : secret invalide');
            return response()->json(['message' => 'Firma no valida.'], 401);
        }

        //--------------- 2. L'evenement ----------------
        $evenement = (string) $request->input('event');
        $idTransaction = (string) $request->input('transactionId');
        $reference = (string) $request->input('partnerId');

        Log::info('Webhook Kkiapay recu : ' . $evenement . ' transaction ' . $idTransaction . ' commande ' . $reference);

        // Seul un paiement reussi nous interesse. On repond 200 aux autres,
        // sinon Kkiapay renverrait le meme message 5 fois.
        if ($evenement !== 'transaction.success') {
            return response()->json(['message' => 'Evento ignorado.']);
        }

        if ($idTransaction === '' || $reference === '') {
            Log::warning('Webhook Kkiapay : transactionId ou partnerId absent');
            return response()->json(['message' => 'Datos incompletos.']);
        }

        //--------------- 3. La commande ----------------
        $commande = Order::where('reference', $reference)->first();

        if (!$commande) {
            Log::warning('Webhook Kkiapay : commande inconnue ' . $reference);
            return response()->json(['message' => 'Pedido desconocido.']);
        }

        //--------------- 4. Les memes verifications que confirmar() ----------------
        // On ne fait pas confiance au contenu du webhook : confirmar() redemande
        // a Kkiapay le statut et le montant, et refuse une transaction deja utilisee.
        $requete = new Request(['transaction_id' => $idTransaction]);
        $reponse = $this->confirmar($requete, $commande);

        Log::info('Webhook Kkiapay : ' . $reference . ' => ' . $reponse->getContent());

        // Toujours 200 : un refus (montant faux, transaction reutilisee...)
        // ne se corrigera pas en renvoyant le message.
        return response()->json(['message' => 'Recibido.']);
    }


    // Demande a Kkiapay le statut d'une transaction.
    // Renvoie la reponse de Kkiapay sous forme de tableau, ou null si Kkiapay ne repond pas.
    private function verifierTransaction($idTransaction)
    {
        $base = 'https://api.kkiapay.me';

        if (config('payments.kkiapay_sandbox')) {
            $base = 'https://api-sandbox.kkiapay.me';
        }

        try {
            $reponse = Http::timeout(15)
                ->withHeaders([
                    'Accept' => 'application/json',
                    'X-API-KEY' => config('payments.kkiapay_public_key'),
                    'X-PRIVATE-KEY' => config('payments.kkiapay_private_key'),
                    'X-SECRET-KEY' => config('payments.kkiapay_secret'),
                ])
                ->post($base . '/api/v1/transactions/status', ['transactionId' => $idTransaction]);
        } catch (\Exception $e) {
            Log::error('Kkiapay injoignable : ' . $e->getMessage());
            return null;
        }

        $donnees = $reponse->json();

        // Une transaction inconnue renvoie un code 400 avec {"status":"TRANSACTION_NOT_FOUND"} :
        // c'est une vraie reponse, on la renvoie. Seul un contenu illisible donne null.
        if (!is_array($donnees)) {
            Log::error('Kkiapay : reponse illisible (code ' . $reponse->status() . ') : ' . $reponse->body());
            return null;
        }

        return $donnees;
    }

    // Les seuls champs renvoyes au navigateur : aucune donnee personnelle (comme OrderController::show)
    private function reponseCommande(Order $order)
    {
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
