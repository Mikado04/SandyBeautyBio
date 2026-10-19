<x-mail::message>
# Nuevo pedido pagado

**{{ $pedido->reference }}** · {{ number_format($pedido->total, 0, ',', ' ') }} {{ $pedido->currency }}

<x-mail::table>
| Artículo | Cant. | Importe |
|:---------|:-----:|--------:|
@foreach ($pedido->items as $ligne)
| {{ $ligne->name }} {{ $ligne->size }} | {{ $ligne->quantity }} | {{ number_format($ligne->subtotal, 0, ',', ' ') }} XAF |
@endforeach
| **Total** | | **{{ number_format($pedido->total, 0, ',', ' ') }} {{ $pedido->currency }}** |
</x-mail::table>

## Clienta

**{{ $pedido->customer_name }}**<br>
WhatsApp: {{ $pedido->customer_phone }}<br>
@if ($pedido->customer_email)
Email: {{ $pedido->customer_email }}<br>
@endif
Entrega: {{ $pedido->customer_city }} · {{ $pedido->customer_address }}

@if ($pedido->notes)
> Nota de la clienta: {{ $pedido->notes }}
@endif

## Pago

@if ($pedido->payment_method === 'kkiapay')
Tarjeta · Kkiapay
@elseif ($pedido->payment_method === 'fedapay')
Mobile Money · FedaPay
@else
Transferencia bancaria
@endif
@if ($paiement && $paiement->external_reference)
 · transacción {{ $paiement->external_reference }}
@endif

<x-mail::button :url="$lienAdmin" color="success">
Ver el pedido
</x-mail::button>

Prepara el pedido y márcalo como «Enviado» cuando salga.

{{ config('app.name') }}
</x-mail::message>
