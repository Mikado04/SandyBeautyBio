import { GAMAS } from '../lib/marca'
import { useRevelar } from '../lib/revelar'

export default function Gamas({ onVerGama }) {
    const sandy = GAMAS[0]
    const bella = GAMAS[1]

    const refTitulo = useRevelar()
    const refSandy = useRevelar()
    const refBella = useRevelar()

    return (
        <section className="bg-[#f0ebe1]">
            <div className="mx-auto max-w-7xl px-6 py-20">
                <div ref={refTitulo} className="revelar grid gap-8 lg:grid-cols-2 lg:items-end">
                    <h2 className="titulo max-w-md text-4xl text-forest lg:text-5xl">
                        Dos gamas, una selva. Elige tu ritual.
                    </h2>

                    <p className="text-sm leading-relaxed text-muted lg:text-right">
                        Precio justo para uso diario y alta biocosmética BIO para tratar en
                        profundidad. Todo cultivado en nuestra finca de Bioko.
                    </p>
                </div>

                <div className="mt-12 grid gap-6 lg:grid-cols-2">
                    {/* Carte claire : Sandy Natur */}
                    <div
                        ref={refSandy}
                        className="revelar elevar rounded-3xl bg-white p-9 shadow-[0_25px_60px_-45px_rgba(27,67,50,0.6)]"
                    >
                        <span className="inline-block rounded-full bg-forest px-4 py-1.5 text-[10px] font-medium tracking-[0.1em] text-white uppercase">
                            {sandy.etiqueta}
                        </span>

                        <h3 className="titulo mt-6 text-3xl tracking-wide text-forest">
                            {sandy.titulo}
                        </h3>

                        <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
                            {sandy.texto}
                        </p>

                        <ul className="mt-7 space-y-3">
                            {sandy.puntos.map((p) => (
                                <li key={p} className="flex items-start gap-3 text-sm text-forest">
                                    <Check color="text-forest" />
                                    {p}
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => onVerGama(sandy.clave)}
                            className="mt-8 inline-flex items-center gap-3 rounded-full border border-forest/20 px-6 py-3 text-[11px] font-medium tracking-[0.15em] text-forest uppercase transition hover:border-forest"
                        >
                            {sandy.boton}
                            <span aria-hidden="true">→</span>
                        </button>
                    </div>

                    {/* Carte verte : Bella Ecuatoguineana BIO */}
                    <div
                        ref={refBella}
                        style={{ transitionDelay: '130ms' }}
                        className="revelar elevar rounded-3xl bg-gradient-to-br from-forest-2 via-forest to-forest-3 p-9 shadow-[0_25px_60px_-40px_rgba(27,67,50,0.9)]"
                    >
                        <span className="inline-block rounded-full border border-gold/50 px-4 py-1.5 text-[10px] font-medium tracking-[0.1em] text-gold uppercase">
                            {bella.etiqueta}
                        </span>

                        <h3 className="titulo mt-6 text-3xl tracking-wide text-white">
                            {bella.titulo}
                        </h3>

                        <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
                            {bella.texto}
                        </p>

                        <ul className="mt-7 space-y-3">
                            {bella.puntos.map((p) => (
                                <li key={p} className="flex items-start gap-3 text-sm text-white/90">
                                    <Check color="text-gold" />
                                    {p}
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => onVerGama(bella.clave)}
                            className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 text-[11px] font-medium tracking-[0.15em] text-forest uppercase transition hover:bg-cream"
                        >
                            {bella.boton}
                            <span aria-hidden="true">→</span>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}

function Check({ color }) {
    return (
        <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className={color + ' mt-0.5 shrink-0'}
        >
            <path d="M20 6 9 17l-5-5" />
        </svg>
    )
}
