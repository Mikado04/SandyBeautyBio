import { useState } from 'react'
import { formatPrice } from '../lib/format'

export default function Cart({ cart, total, count, onChangeQuantity, onRemove, onCheckout }) {
    const [open, setOpen] = useState(false)

    // Panier vide : on n'affiche rien du tout
    if (cart.length === 0) {
        return null
    }

    let libelleBouton = 'Ver el carrito'

    if (open) {
        libelleBouton = 'Ocultar el carrito'
    }

    return (
        <div className="fixed right-0 bottom-0 left-0 z-40 border-t border-gold/30 bg-forest text-cream">
            {open && (
                <div className="mx-auto max-h-72 max-w-4xl overflow-y-auto px-6 py-4">
                    {cart.map((ligne) => (
                        <div
                            key={ligne.product.id}
                            className="flex items-center gap-3 border-b border-cream/10 py-3"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm text-cream">{ligne.product.name}</p>
                                <p className="text-[11px] text-cream/50">
                                    {ligne.product.size} · {formatPrice(ligne.product.price)}
                                </p>
                            </div>

                            <button
                                onClick={() => onChangeQuantity(ligne.product.id, ligne.quantity - 1)}
                                className="h-8 w-8 border border-cream/25 text-lg leading-none text-cream hover:border-gold hover:text-gold"
                            >
                                -
                            </button>

                            <span className="w-6 text-center text-sm">{ligne.quantity}</span>

                            <button
                                onClick={() => onChangeQuantity(ligne.product.id, ligne.quantity + 1)}
                                className="h-8 w-8 border border-cream/25 text-lg leading-none text-cream hover:border-gold hover:text-gold"
                            >
                                +
                            </button>

                            <span className="w-28 text-right text-sm text-gold">
                                {formatPrice(ligne.product.price * ligne.quantity)}
                            </span>

                            <button
                                onClick={() => onRemove(ligne.product.id)}
                                className="text-[11px] text-cream/50 hover:text-gold"
                            >
                                Quitar
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-6 py-4">
                <button
                    onClick={() => setOpen(!open)}
                    className="text-xs tracking-[0.15em] text-cream/70 uppercase hover:text-gold"
                >
                    {libelleBouton} ({count})
                </button>

                <span className="font-display text-xl text-gold">{formatPrice(total)}</span>

                <button
                    onClick={onCheckout}
                    className="bg-gold px-8 py-3 text-[11px] tracking-[0.2em] text-forest uppercase transition hover:bg-gold-light"
                >
                    Pagar
                </button>
            </div>
        </div>
    )
}
