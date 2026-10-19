import { formatPrice } from '../lib/format'

export default function Cart({ abierto, cart, total, onClose, onChangeQuantity, onRemove, onCheckout }) {
    if (!abierto) {
        return null
    }

    return (
        <div className="fixed inset-0 z-60 flex justify-end">
            <button
                onClick={onClose}
                className="aparecer flex-1 bg-forest/30 backdrop-blur-[2px]"
                aria-label="Cerrar"
            />

            <aside className="deslizar-derecha flex w-full max-w-md flex-col bg-[#fdfbf7] shadow-2xl">
                <div className="flex items-center justify-between border-b border-forest/10 px-6 py-5">
                    <h2 className="titulo text-xl text-forest">Tu carrito</h2>
                    <button
                        onClick={onClose}
                        aria-label="Cerrar el carrito"
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-forest/25 bg-white text-forest transition-colors hover:border-forest hover:bg-forest hover:text-white"
                    >
                        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 6l12 12" />
                            <path d="M18 6L6 18" />
                        </svg>
                    </button>
                </div>

                {cart.length === 0 && (
                    <div className="flex flex-1 items-center justify-center px-6">
                        <p className="text-sm text-muted">El carrito está vacío.</p>
                    </div>
                )}

                {cart.length > 0 && (
                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        {cart.map((ligne) => (
                            <div
                                key={ligne.product.id}
                                className="flex items-start gap-4 border-b border-forest/10 py-4"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="titulo text-[15px] leading-snug text-forest">
                                        {ligne.product.name}
                                    </p>
                                    <p className="mt-1 text-[12px] text-muted">
                                        {formatPrice(ligne.product.price)}
                                    </p>

                                    <div className="mt-3 flex items-center gap-2">
                                        <button
                                            onClick={() =>
                                                onChangeQuantity(ligne.product.id, ligne.quantity - 1)
                                            }
                                            className="h-7 w-7 rounded-full border border-forest/15 text-sm leading-none text-forest hover:border-forest"
                                        >
                                            −
                                        </button>

                                        <span className="w-6 text-center text-sm text-forest">
                                            {ligne.quantity}
                                        </span>

                                        <button
                                            onClick={() =>
                                                onChangeQuantity(ligne.product.id, ligne.quantity + 1)
                                            }
                                            className="h-7 w-7 rounded-full border border-forest/15 text-sm leading-none text-forest hover:border-forest"
                                        >
                                            +
                                        </button>

                                        <button
                                            onClick={() => onRemove(ligne.product.id)}
                                            className="boton-peligro boton-mini ml-3"
                                        >
                                            Quitar
                                        </button>
                                    </div>
                                </div>

                                <span className="titulo shrink-0 text-[15px] text-forest">
                                    {formatPrice(ligne.product.price * ligne.quantity)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="border-t border-forest/10 px-6 py-5">
                    <div className="flex items-baseline justify-between">
                        <span className="text-[10px] tracking-[0.18em] text-muted uppercase">
                            Total
                        </span>
                        <span className="titulo text-2xl text-forest">{formatPrice(total)}</span>
                    </div>

                    <button
                        onClick={onCheckout}
                        disabled={cart.length === 0}
                        className="mt-5 w-full rounded-full bg-forest py-4 text-[11px] font-medium tracking-[0.15em] text-white uppercase transition hover:bg-forest-2 disabled:bg-forest/25"
                    >
                        Finalizar pedido
                    </button>

                    <p className="mt-3 text-center text-[11px] text-muted">
                        Envío Malabo 1 500 XAF · Bata 5 000 XAF
                    </p>
                </div>
            </aside>
        </div>
    )
}
