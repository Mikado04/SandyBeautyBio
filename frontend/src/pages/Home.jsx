import { GAMAS, CERTIFICACIONES } from '../lib/marca'

export default function Home({ onNavigate }) {
    return (
        <div>
            <section className="relative overflow-hidden bg-forest text-cream">
                <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
                    <p className="text-[11px] tracking-[0.35em] text-gold uppercase">
                        Malabo · Isla de Bioko
                    </p>

                    <h1 className="font-display mt-6 text-5xl leading-[1.05] md:text-7xl">
                        Belleza natural,
                        <br />
                        <span className="text-gold">de la selva a tu piel.</span>
                    </h1>

                    <p className="mt-8 max-w-xl text-base leading-relaxed text-cream/70">
                        Biocosmética certificada, cultivada y fabricada en Malabo, Guinea Ecuatorial.
                        Moringa, cacao y coco de nuestra propia finca agroecológica.
                    </p>

                    <div className="mt-10 flex flex-wrap gap-4">
                        <button
                            onClick={() => onNavigate('tienda')}
                            className="bg-gold px-8 py-4 text-[11px] tracking-[0.2em] text-forest uppercase transition hover:bg-gold-light"
                        >
                            Descubrir la tienda
                        </button>

                        <button
                            onClick={() => onNavigate('cabina')}
                            className="border border-cream/30 px-8 py-4 text-[11px] tracking-[0.2em] text-cream uppercase transition hover:border-gold hover:text-gold"
                        >
                            Reservar masaje
                        </button>
                    </div>
                </div>

                <div className="border-t border-cream/10">
                    <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-x-10 gap-y-3 px-6 py-5">
                        {CERTIFICACIONES.map((c) => (
                            <span
                                key={c}
                                className="text-[10px] tracking-[0.25em] text-cream/50 uppercase"
                            >
                                {c}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-6 py-20">
                <p className="text-[11px] tracking-[0.3em] text-gold uppercase">Nuestras gamas</p>

                <h2 className="font-display mt-4 text-4xl text-forest">Dos maneras de cuidarse</h2>

                <div className="mt-12 grid gap-6 md:grid-cols-2">
                    {GAMAS.map((gama) => (
                        <div
                            key={gama.clave}
                            className="border border-forest/10 bg-white p-8 transition hover:border-gold/60"
                        >
                            <p className="text-[10px] tracking-[0.25em] text-gold uppercase">
                                {gama.lema}
                            </p>

                            <h3 className="font-display mt-3 text-2xl text-forest">{gama.nombre}</h3>

                            <p className="mt-4 text-sm leading-relaxed text-forest/60">
                                {gama.texto}
                            </p>

                            <button
                                onClick={() => onNavigate('tienda')}
                                className="mt-6 text-[11px] tracking-[0.2em] text-forest uppercase underline decoration-gold underline-offset-4 hover:text-gold"
                            >
                                Ver productos
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-white">
                <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-3">
                    <Argumento
                        titulo="100% trazable Bioko"
                        texto="Agroforestería, 0% palma, recolección manual en nuestra finca familiar."
                    />
                    <Argumento
                        titulo="Envío 24h Malabo"
                        texto="Preparamos y entregamos en la ciudad en menos de 24 horas."
                    />
                    <Argumento
                        titulo="Pagos seguros"
                        texto="Transferencia bancaria Bange, Muni Dinero y tarjeta."
                    />
                </div>
            </section>
        </div>
    )
}

function Argumento({ titulo, texto }) {
    return (
        <div className="border-t border-gold pt-5">
            <h3 className="font-display text-xl text-forest">{titulo}</h3>
            <p className="mt-2 text-sm leading-relaxed text-forest/60">{texto}</p>
        </div>
    )
}
