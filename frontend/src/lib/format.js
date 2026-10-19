// Affiche un montant comme sur la maquette : 35 000 XAF
export function formatPrice(value, currency = 'XAF') {
    const entier = Math.round(value)
    const separe = new Intl.NumberFormat('fr-FR').format(entier)

    return separe + ' ' + currency
}

// Affiche une date de l'API (en UTC) a l'heure de Malabo : "18 oct, 11:42"
// Renvoie un tiret si la date est vide (etape pas encore atteinte).
export function formatFecha(valeur) {
    if (!valeur) {
        return '—'
    }

    const date = new Date(valeur)

    const jour = new Intl.DateTimeFormat('es-ES', {
        day: 'numeric',
        month: 'short',
        timeZone: 'Africa/Malabo',
    }).format(date)

    const heure = new Intl.DateTimeFormat('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Africa/Malabo',
    }).format(date)

    return jour + ', ' + heure
}
