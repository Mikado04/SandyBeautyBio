<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;

use function Illuminate\Support\now;

class AdminOrderController extends Controller
{
    // Les statuts possibles d'une commande (colonne orders.status)
    // pending   = en attente de paiement
    // paid      = payee, a preparer ("Por preparar")
    // shipped   = envoyee
    // delivered = livree
    // cancelled = annulee
    private $statuts = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

    // Liste des commandes, avec filtre par statut et recherche
    public function index(Request $request)
    {
        // withCount ajoute "items_count" : le nombre de lignes de la commande
        $requete = Order::withCount('items');

        //--------------- 1. Filtre par statut ----------------
        $statut = $request->query('status');

        if ($statut) {
            if (!in_array($statut, $this->statuts, true)) {
                abort(404, 'Estado desconocido.');
            }

            $requete->where('status', $statut);
        }

        //--------------- 2. Recherche : reference, nom ou telephone ----------------
        $recherche = $request->query('search');

        if ($recherche) {
            $motif = '%' . $recherche . '%';

            // Les trois conditions sont regroupees entre parentheses en SQL :
            // ... WHERE status = 'paid' AND (reference LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)
            // Sans ce regroupement, le OR annulerait le filtre de statut.
            $requete->where(function ($sousRequete) use ($motif) {
                $sousRequete->where('reference', 'like', $motif);
                $sousRequete->orWhere('customer_name', 'like', $motif);
                $sousRequete->orWhere('customer_phone', 'like', $motif);
            });
        }

        //--------------- 3. Les plus recentes d'abord, 20 par page ----------------
        $requete->orderBy('created_at', 'desc');
        $commandes = $requete->paginate(20);

        //--------------- 4. Le nombre de commandes de chaque statut ----------------
        // Pour afficher "Por preparar 4", "Enviados 3"... sur les filtres
        $compteurs = [];
        $total = 0;

        foreach ($this->statuts as $unStatut) {
            $nombre = Order::where('status', $unStatut)->count();
            $compteurs[$unStatut] = $nombre;
            $total = $total + $nombre;
        }

        $compteurs['all'] = $total;

        // Version condensee possible des compteurs, en une seule requete SQL :
        // Order::selectRaw('status, count(*) as n')->groupBy('status')->pluck('n', 'status');
        // Une requete au lieu de cinq : plus rapide, mais plus difficile a lire et a deboguer.

        return response()->json([
            'pedidos' => $commandes,
            'compteurs' => $compteurs,
        ]);
    }

    // Fiche d'une commande. Route reservee a l'admin : on renvoie TOUT,
    // y compris le telephone et l'adresse (contrairement a OrderController::show)
    public function show(Order $order)
    {
        $order->load('items');
        $order->load('payments');

        return response()->json(['data' => $order]);
    }

    
    // Faire avancer une commande : envoyee, livree ou annulee
    public function updateStatus(Request $request, Order $order)
    {
        //--------------- 1. Validation ----------------
        // "paid" ne se pose jamais a la main : c'est le paiement verifie qui le pose
        $donnees = $request->validate([
            'status' => 'required|in:shipped,delivered,cancelled',
        ]);

        $nouveau = $donnees['status'];
        $actuel = $order->status;

        //--------------- 2. Le passage est-il permis ? ----------------
        $permis = false;

        if ($nouveau === 'shipped' && $actuel === 'paid') {
            $permis = true;
        }

        if ($nouveau === 'delivered' && $actuel === 'shipped') {
            $permis = true;
        }

        // On annule tant que la commande n'est pas partie
        if ($nouveau === 'cancelled' && ($actuel === 'pending' || $actuel === 'paid')) {
            $permis = true;
        }

        if (!$permis) {
            return response()->json([
                'message' => 'No se puede pasar del estado "' . $actuel . '" a "' . $nouveau . '".',
            ], 422);
        }

        //--------------- 3. On applique le changement ----------------
        $order->status = $nouveau;

        if ($nouveau === 'shipped') {
            $order->shipped_at = now();
        }

        if ($nouveau === 'delivered') {
            $order->delivered_at = now();
        }

        //--------------- 4. Annulation : stock et paiement ----------------
        if ($nouveau === 'cancelled') {
            $order->cancelled_at = now();

            // Jamais payee : le paiement en attente echoue.
            // Deja payee : payment_status reste "paid" -> remboursement a faire a la main.
            if ($order->payment_status === 'pending') {
                $order->payment_status = 'failed';

                foreach ($order->payments as $paiement) {
                    if ($paiement->status === 'pending') {
                        $paiement->status = 'failed';
                        $paiement->save();
                    }
                }
            }

            // Le stock avait ete retire a la commande : on le remet
            foreach ($order->items as $ligne) {
                $produit = Product::find($ligne->product_id);

                if ($produit) {
                    $produit->stock = $produit->stock + $ligne->quantity;
                    $produit->save();
                }
            }
        }

        $order->save();

        Log::info('Admin : commande ' . $order->reference . ' passee de ' . $actuel . ' a ' . $nouveau);

        // On renvoie la fiche a jour, comme show()
        return $this->show($order);
    }

    
    // Statistiques du tableau de bord : ?periodo=hoy | mes | mes_anterior
    public function stats(Request $request)
    {
        //--------------- 1. La periode, en heure de Malabo ----------------
        $periodo = $request->query('periodo', 'mes');
        $maintenant = now('Africa/Malabo');

        if ($periodo === 'hoy') {
            $debut = $maintenant->copy()->startOfDay();
            $fin = $maintenant->copy()->endOfDay();
        } elseif ($periodo === 'mes') {
            $debut = $maintenant->copy()->startOfMonth();
            $fin = $maintenant->copy()->endOfMonth();
        } elseif ($periodo === 'mes_anterior') {
            // subMonthNoOverflow : le 31 mars donne bien fevrier, pas le 3 mars
            $debut = $maintenant->copy()->subMonthNoOverflow()->startOfMonth();
            $fin = $debut->copy()->endOfMonth();
        } else {
            abort(404, 'Periodo desconocido.');
        }

        //--------------- 2. Les commandes vendues dans la periode ----------------
        // Vendue = payee et pas annulee. paid_at est en UTC en base : on convertit les bornes.
        $requete = Order::with('items');
        $requete->whereIn('status', ['paid', 'shipped', 'delivered']);
        $requete->whereBetween('paid_at', [$debut->copy()->utc(), $fin->copy()->utc()]);
        $commandes = $requete->get();

        //--------------- 3. Totaux, ventes par jour, produits vendus ----------------
        $ventes = 0;
        $parJour = [];
        $produits = [];

        // Chaque jour de la periode demarre a 0, pour que le graphique n'ait pas de trou
        $jour = $debut->copy();

        while ($jour->lte($fin)) {
            $parJour[$jour->format('Y-m-d')] = 0;
            $jour->addDay();
        }

        foreach ($commandes as $commande) {
            $ventes = $ventes + $commande->total;

            // Le jour de la vente, en heure de Malabo
            $cle = $commande->paid_at->copy()->setTimezone('Africa/Malabo')->format('Y-m-d');

            if (isset($parJour[$cle])) {
                $parJour[$cle] = $parJour[$cle] + $commande->total;
            }

            // On cumule par nom de produit (le nom recopie au moment de l'achat)
            foreach ($commande->items as $ligne) {
                $nom = $ligne->name;

                if (!isset($produits[$nom])) {
                    $produits[$nom] = ['nombre' => $nom, 'unidades' => 0, 'importe' => 0];
                }

                $produits[$nom]['unidades'] = $produits[$nom]['unidades'] + $ligne->quantity;
                $produits[$nom]['importe'] = $produits[$nom]['importe'] + $ligne->subtotal;
            }
        }

        $nombre = count($commandes);
        $ticketMedio = 0;

        if ($nombre > 0) {
            // intdiv : division entiere, le franc CFA n'a pas de centimes
            $ticketMedio = intdiv($ventes, $nombre);
        }

        //--------------- 4. Les 5 produits les plus vendus ----------------
        $classement = array_values($produits);

        // Tri du plus grand nombre d'unites au plus petit
        usort($classement, function ($a, $b) {
            return $b['unidades'] - $a['unidades'];
        });

        $top = array_slice($classement, 0, 5);

        // Le graphique attend une liste [{fecha, total}, ...]
        $serie = [];

        foreach ($parJour as $date => $totalJour) {
            $serie[] = ['fecha' => $date, 'total' => $totalJour];
        }

        //--------------- 5. Les chiffres du moment (independants de la periode) ----------------
        $porPreparar = Order::where('status', 'paid')->count();
        $pendientes = Order::where('status', 'pending')->count();

        // Les ventes du jour, affichees sur leur propre carte
        $requeteJour = Order::whereIn('status', ['paid', 'shipped', 'delivered']);
        $requeteJour->whereBetween('paid_at', [
            $maintenant->copy()->startOfDay()->utc(),
            $maintenant->copy()->endOfDay()->utc(),
        ]);
        $ventasHoy = (int) $requeteJour->sum('total');
        $pedidosHoy = $requeteJour->count();

        return response()->json([
            'periodo' => $periodo,
            'desde' => $debut->format('Y-m-d'),
            'hasta' => $fin->format('Y-m-d'),
            'ventas' => $ventes,
            'pedidos_pagados' => $nombre,
            'ticket_medio' => $ticketMedio,
            'ventas_hoy' => $ventasHoy,
            'pedidos_hoy' => $pedidosHoy,
            'por_preparar' => $porPreparar,
            'pendientes' => $pendientes,
            'ventas_por_dia' => $serie,
            'mas_vendidos' => $top,
        ]);
    }


}
