export function formatPrice(value, currency = 'XAF') {
    return new Intl.NumberFormat('es-GQ', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0,
    }).format(value)
}
