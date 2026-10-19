<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

// E-mail envoye a la boutique quand une commande vient d'etre payee.
// Vue : resources/views/emails/pedido-pagado.blade.php
class PedidoPagado extends Mailable
{
    use Queueable, SerializesModels;

    public $pedido;

    public function __construct(Order $pedido)
    {
        $this->pedido = $pedido;
    }

    // Le sujet : la reference et le montant, visibles des la boite de reception
    public function envelope(): Envelope
    {
        // 23500 -> "23 500"
        $montant = number_format($this->pedido->total, 0, ',', ' ');

        return new Envelope(
            subject: 'Nuevo pedido pagado · ' . $this->pedido->reference . ' · ' . $montant . ' ' . $this->pedido->currency,
        );
    }

    // La vue Markdown et les donnees qu'elle affiche
    public function content(): Content
    {
        $this->pedido->load('items');
        $this->pedido->load('payments');

        return new Content(
            markdown: 'emails.pedido-pagado',
            with: [
                'pedido' => $this->pedido,
                'paiement' => $this->pedido->payments->first(),
                // L'administration s'ouvre directement sur la liste des commandes
                'lienAdmin' => config('payments.frontend_url') . '/#admin',
            ],
        );
    }
}
