<?php

return [
    // Virement bancaire — Guinée Équatoriale
    'bank_transfer_enabled' => env('PAY_BANK_TRANSFER_ENABLED', true),
    'bank_name'             => env('BANK_NAME', 'BANGE'),
    'bank_account_name'     => env('BANK_ACCOUNT_NAME', 'Sandy Beauty Bio'),
    'bank_account_number'   => env('BANK_ACCOUNT_NUMBER'),
    'bank_swift'            => env('BANK_SWIFT'),

    // FedaPay — Bénin
    'fedapay_enabled'        => env('PAY_FEDAPAY_ENABLED', false),
    'fedapay_env'            => env('FEDAPAY_ENV', 'sandbox'),
    'fedapay_secret_key'     => env('FEDAPAY_SECRET_KEY'),
    'fedapay_webhook_secret' => env('FEDAPAY_WEBHOOK_SECRET'),
    'frontend_url' => env('FRONTEND_URL', 'http://localhost:5173'),
];