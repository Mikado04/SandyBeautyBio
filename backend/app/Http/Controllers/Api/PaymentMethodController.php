<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

class PaymentMethodController extends Controller
{
    public function index()
    {
        $methods = [];
        if (config('payments.bank_transfer_enabled')) {
            $methods[] = [
                'key' => 'bank_transfer',
                'label' => 'Transferencia bancaria',
                'type' => 'instructions',
                'currency' => 'XAF',
            ];
        }

        if (config('payments.fedapay_enabled')) {
            $methods[] = [
                'key' => 'fedapay',
                'label' => 'Mobile Money (África Occidental)',
                'type' => 'redirect',
                'currency' => 'XOF',
            ];
        }

        // Kkiapay : le paiement se fait dans une fenetre ouverte sur le site ("widget"),
        // pas sur une page externe comme FedaPay. Interet : les cartes Visa/Mastercard.
        if (config('payments.kkiapay_enabled')) {
            $methods[] = [
                'key' => 'kkiapay',
                'label' => 'Tarjeta Visa / Mastercard',
                'type' => 'widget',
                'currency' => 'XOF',
            ];
        }


        return response()->json(['data' => $methods]);
    }

}
