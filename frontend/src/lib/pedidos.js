// Tout ce qui sert a afficher le statut d'une commande, utilise par la liste
// des commandes ET par la fiche d'une commande (pages/AdminPedidos.jsx,
// pages/AdminPedidoDetalle.jsx). Les valeurs viennent de la colonne orders.status.

// Le libelle en espagnol d'un statut
export function etiquetaEstado(status) {
    if (status === 'pending') {
        return 'Pendiente de pago'
    }

    if (status === 'paid') {
        return 'Por preparar'
    }

    if (status === 'shipped') {
        return 'Enviado'
    }

    if (status === 'delivered') {
        return 'Entregado'
    }

    if (status === 'cancelled') {
        return 'Anulado'
    }

    return status
}

// Les classes Tailwind du badge de statut.
// Chaque statut a sa forme (pointilles, contour, plein, barre) en plus de sa couleur :
// on ne distingue jamais deux statuts par la couleur seule.
export function claseEstado(status) {
    const base = 'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11.5px] font-medium whitespace-nowrap'

    if (status === 'pending') {
        return base + ' border border-dashed border-[#d99a4e] bg-white text-[#8a4b0f]'
    }

    if (status === 'paid') {
        return base + ' bg-[#fff3d6] text-[#7a5a1c] shadow-[inset_0_0_0_1px_#c9a86a]'
    }

    if (status === 'shipped') {
        return base + ' bg-[#e8efe9] text-forest'
    }

    if (status === 'delivered') {
        return base + ' bg-forest text-white'
    }

    // cancelled
    return base + ' bg-[#efeeec] text-[#5d5d5a] line-through'
}

// Le nom lisible du moyen de paiement
export function etiquetaPago(paymentMethod) {
    if (paymentMethod === 'kkiapay') {
        return 'Tarjeta · Kkiapay'
    }

    if (paymentMethod === 'fedapay') {
        return 'Mobile Money · FedaPay'
    }

    if (paymentMethod === 'bank_transfer') {
        return 'Transferencia'
    }

    return paymentMethod
}

// Lien WhatsApp vers la cliente, a partir du telephone saisi dans la commande.
// Un numero local de Guinee Equatoriale (9 chiffres, sans indicatif) recoit +240.
export function enlaceWhatsAppCliente(telefono, mensaje) {
    let chiffres = String(telefono).replace(/[^0-9]/g, '')

    if (chiffres.length === 9) {
        chiffres = '240' + chiffres
    }

    return 'https://wa.me/' + chiffres + '?text=' + encodeURIComponent(mensaje)
}

// Ou rendre l'argent d'une commande payee puis annulee :
// le remboursement se fait a la main, chez le prestataire qui a encaisse.
export function dondeReembolsar(paymentMethod) {
    if (paymentMethod === 'kkiapay') {
        return 'desde el panel de Kkiapay'
    }

    if (paymentMethod === 'fedapay') {
        return 'desde el panel de FedaPay'
    }

    return 'por transferencia bancaria'
}
