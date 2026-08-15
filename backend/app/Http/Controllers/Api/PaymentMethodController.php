<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

class PaymentMethodController extends Controller
{
    public function index()
    {
        $methods = [];
        if(config('payments.bank_transfer_enabled')){
            $methods[] = [
                'key' => 'bank_transfer',
                'label' => 'Transferencia bancaria',
                'type' => 'instructions',
                'currency' => 'XAF',
            ];
        }

        if(config('payments.fedapay_enabled')){
            $methods[] =[
                'key' => 'fedapay',
                'label' => 'Mobile Money/ Carte (Benin)',
                'type' => 'redirect',
                'currency' => 'XOF',
            ];
        }
        return response()->json(['data' => $methods]);
    }

}
