import emblema from '../assets/emblema.png'
import { CERTIFICACIONES } from '../lib/marca'

export default function Hero({ onReservar }) {
    function irA(id) {
        const seccion = document.getElementById(id)

        if (seccion) {
            seccion.scrollIntoView({ behavior: 'smooth' })
        }
    }

    return (
        <section id="inicio" className="bg-[#f7f4ee]">
            <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-24">
                <div>
                    <span className="entrada inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[11px] tracking-[0.15em] text-forest uppercase shadow-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-muted" />
                        Cultivado en Bioko · Fabricado en Malabo
                    </span>

                    <h1
                        className="titulo entrada mt-8 text-5xl text-forest lg:text-6xl"
                        style={{ animationDelay: '110ms' }}
                    >
                        Belleza natural,
                        <br />
                        <span className="text-forest-3 italic">lujo sostenible.</span>
                    </h1>

                    <p
                        className="entrada mt-7 max-w-lg leading-relaxed text-muted"
                        style={{ animationDelay: '200ms' }}
                    >
                        Biocosmética certificada, cultivada y fabricada en Malabo, Guinea Ecuatorial.
                        Moringa, cacao y coco de nuestra propia finca agroecológica.
                    </p>

                    <div
                        className="entrada mt-9 flex flex-wrap gap-4"
                        style={{ animationDelay: '290ms' }}
                    >
                        <button
                            onClick={() => irA('tienda')}
                            className="inline-flex items-center gap-3 rounded-full bg-forest px-7 py-4 text-[11px] font-medium tracking-[0.15em] text-white uppercase transition hover:bg-forest-2"
                        >
                            Explorar colecciones
                            <span aria-hidden="true">→</span>
                        </button>

                        <button
                            onClick={onReservar}
                            className="inline-flex items-center gap-2 rounded-full border border-forest/15 bg-white px-7 py-4 text-[11px] font-medium tracking-[0.15em] text-forest uppercase transition hover:border-forest/40"
                        >
                            Reservar masaje
                        </button>
                    </div>

                    <div
                        className="entrada mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-forest/10 pt-7"
                        style={{ animationDelay: '380ms' }}
                    >
                        <Cifra valor="100%" etiqueta="Natural" />
                        <Cifra valor="21" etiqueta="Fórmulas vivas" />
                        <Cifra valor="Bioko" etiqueta="Origen trazado" />
                    </div>
                </div>

                <div className="relative">
                    <div
                        className="entrada-zoom overflow-hidden rounded-3xl bg-gradient-to-br from-white to-cream-2 p-6 shadow-[0_30px_70px_-40px_rgba(27,67,50,0.5)]"
                        style={{ animationDelay: '180ms' }}
                    >
                        <img
                            src={emblema}
                            alt="Sandy Beauty Biocosmética S.L.U."
                            className="flotar mx-auto w-full max-w-md object-contain"
                        />

                        <div className="mt-6 rounded-2xl bg-white/85 p-5">
                            <p className="text-[10px] tracking-[0.2em] text-muted uppercase">
                                Edición de la selva
                            </p>
                            <p className="titulo mt-2 text-lg text-forest">
                                De la hoja a tu piel. Sin intermediarios.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-forest/10">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6 py-5">
                    <span className="text-[10px] tracking-[0.2em] text-muted uppercase">
                        Certificaciones :
                    </span>

                    {CERTIFICACIONES.map((c) => (
                        <span
                            key={c}
                            className="text-[10px] tracking-[0.15em] text-forest uppercase"
                        >
                            {c}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    )
}

function Cifra({ valor, etiqueta }) {
    return (
        <div>
            <p className="titulo text-2xl text-forest">{valor}</p>
            <p className="mt-1 text-[10px] tracking-[0.15em] text-muted uppercase">{etiqueta}</p>
        </div>
    )
}
