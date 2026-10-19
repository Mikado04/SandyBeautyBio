import { useState } from 'react'
import emblema from '../assets/emblema.png'

const ENLACES = [
    { id: 'inicio', texto: 'Inicio' },
    { id: 'tienda', texto: 'Tienda' },
    { id: 'masajes', texto: 'Masajes' },
    { id: 'nosotros', texto: 'Nosotros' },
    { id: 'contacto', texto: 'Contacto' },
]

export default function Header({ count, onCart, onReservar }) {
    const [activo, setActivo] = useState('inicio')

    // Page unique : chaque lien fait defiler vers sa section
    function irA(id) {
        setActivo(id)

        const seccion = document.getElementById(id)

        if (seccion) {
            seccion.scrollIntoView({ behavior: 'smooth' })
        }
    }

    function enlaceClass(id) {
        if (activo === id) {
            return 'border-b-2 border-forest pb-1 text-sm font-medium text-forest'
        }

        return 'border-b-2 border-transparent pb-1 text-sm text-muted transition hover:text-forest'
    }

    return (
        <header className="sticky top-0 z-50 border-b border-forest/10 bg-[#fdfbf7]">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-3">
                <button onClick={() => irA('inicio')} className="flex items-center gap-3">
                    <img
                        src={emblema}
                        alt="Sandy Beauty"
                        className="h-10 w-10 shrink-0 rounded-full object-cover"
                    />
                    <span className="text-left">
                        <span className="titulo block text-sm font-semibold tracking-wide text-forest">
                            SANDY BEAUTY
                        </span>
                        <span className="block text-[9px] tracking-[0.2em] text-muted uppercase">
                            Biocosmética S.L.U.
                        </span>
                    </span>
                </button>

                <nav className="hidden items-center gap-8 lg:flex">
                    {ENLACES.map((e) => (
                        <button key={e.id} onClick={() => irA(e.id)} className={enlaceClass(e.id)}>
                            {e.texto}
                        </button>
                    ))}
                </nav>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onCart}
                        className="relative rounded-xl border border-forest/15 bg-white p-2.5 transition hover:border-forest/40"
                        aria-label="Carrito"
                    >
                        <IconoBolsa />
                        {count > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-forest text-[10px] font-medium text-white">
                                {count}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={onReservar}
                        className="rounded-full bg-gold px-6 py-2.5 text-[11px] font-medium tracking-[0.15em] text-white uppercase transition hover:bg-gold-2"
                    >
                        Reservar
                    </button>
                </div>
            </div>

            <nav className="flex gap-6 overflow-x-auto border-t border-forest/10 px-6 py-2.5 lg:hidden">
                {ENLACES.map((e) => (
                    <button
                        key={e.id}
                        onClick={() => irA(e.id)}
                        className="text-sm whitespace-nowrap text-muted"
                    >
                        {e.texto}
                    </button>
                ))}
            </nav>
        </header>
    )
}

function IconoBolsa() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-forest"
        >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
    )
}
