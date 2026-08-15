import { MARCA } from '../lib/marca'

export default function Header({ page, onNavigate, count, onCart }) {
    // Onglet actif souligne, les autres non
    function lienClass(cible) {
        if (page === cible) {
            return 'text-gold border-b border-gold pb-0.5'
        }

        return 'text-cream/80 hover:text-gold transition'
    }

    return (
        <header className="sticky top-0 z-40 bg-forest text-cream">
            <div className="border-b border-cream/10">
                <p className="mx-auto max-w-6xl px-6 py-2 text-center text-[11px] tracking-[0.25em] text-gold uppercase">
                    Tienda Oficial · Envío Malabo 24h · Pago: Bange · Muni · Tarjeta
                </p>
            </div>

            <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-5">
                <button onClick={() => onNavigate('inicio')} className="text-left">
                    <span className="font-display block text-xl leading-none tracking-wide">
                        {MARCA.nombre}
                    </span>
                    <span className="text-[10px] tracking-[0.3em] text-gold uppercase">
                        Biocosmética BIO
                    </span>
                </button>

                <nav className="hidden gap-8 text-sm md:flex">
                    <button onClick={() => onNavigate('inicio')} className={lienClass('inicio')}>
                        Inicio
                    </button>
                    <button onClick={() => onNavigate('tienda')} className={lienClass('tienda')}>
                        Tienda
                    </button>
                    <button onClick={() => onNavigate('cabina')} className={lienClass('cabina')}>
                        Cabina
                    </button>
                    <button onClick={() => onNavigate('nosotros')} className={lienClass('nosotros')}>
                        Nosotros
                    </button>
                </nav>

                <button
                    onClick={onCart}
                    className="rounded-full border border-gold/50 px-4 py-2 text-xs tracking-wider text-gold uppercase transition hover:bg-gold hover:text-forest"
                >
                    Carrito · {count}
                </button>
            </div>

            <nav className="flex gap-6 border-t border-cream/10 px-6 py-3 text-sm md:hidden">
                <button onClick={() => onNavigate('inicio')} className={lienClass('inicio')}>
                    Inicio
                </button>
                <button onClick={() => onNavigate('tienda')} className={lienClass('tienda')}>
                    Tienda
                </button>
                <button onClick={() => onNavigate('cabina')} className={lienClass('cabina')}>
                    Cabina
                </button>
                <button onClick={() => onNavigate('nosotros')} className={lienClass('nosotros')}>
                    Nosotros
                </button>
            </nav>
        </header>
    )
}
