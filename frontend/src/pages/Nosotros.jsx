import { MARCA, CERTIFICACIONES } from '../lib/marca'

export default function Nosotros() {
    return (
        <div>
            <section className="bg-forest text-cream">
                <div className="mx-auto max-w-6xl px-6 py-20">
                    <p className="text-[11px] tracking-[0.3em] text-gold uppercase">
                        Nuestra historia
                    </p>

                    <h1 className="font-display mt-5 max-w-2xl text-4xl leading-tight md:text-5xl">
                        De la finca familiar a la biocosmética certificada.
                    </h1>
                </div>
            </section>

            <section className="mx-auto max-w-3xl px-6 py-16">
                <p className="text-lg leading-relaxed text-forest/80">
                    Biocosmética de selva. Cultivamos, prensamos, formulamos y masajeamos en Malabo.
                </p>

                <p className="mt-6 leading-relaxed text-forest/60">
                    Todo empieza en nuestra finca agroecológica de la isla de Bioko: moringa, cacao y
                    coco recolectados a mano, sin aceite de palma y en agroforestería. Prensamos en
                    frío y formulamos en pequeños lotes, con trazabilidad de lote a hoja.
                </p>

                <p className="mt-6 leading-relaxed text-forest/60">
                    Fabricamos el 100% de nuestros productos en Guinea Ecuatorial, con empleo digno
                    para mujeres de la comunidad. Nuestras dos gamas responden a dos necesidades: el
                    cuidado diario accesible con SANDY NATUR, y la alta biocosmética certificada con
                    BELLA ECUATOGUINEANA BIO.
                </p>

                <div className="mt-12 border-t border-gold pt-8">
                    <p className="text-[11px] tracking-[0.3em] text-gold uppercase">
                        Certificaciones
                    </p>

                    <div className="mt-5 flex flex-wrap gap-3">
                        {CERTIFICACIONES.map((c) => (
                            <span
                                key={c}
                                className="border border-forest/20 px-4 py-2 text-[11px] tracking-widest text-forest uppercase"
                            >
                                {c}
                            </span>
                        ))}
                    </div>

                    <p className="mt-5 text-sm text-forest/50">
                        ISO 9001 y 22716 GMP para la fabricación, ISO 16128 para el origen natural de
                        los ingredientes, y registro OAPI de nuestras marcas.
                    </p>
                </div>

                <div className="mt-12 border border-forest/10 bg-white p-8">
                    <p className="text-[11px] tracking-[0.25em] text-gold uppercase">Visítanos</p>
                    <p className="font-display mt-3 text-xl text-forest">{MARCA.razonSocial}</p>
                    <p className="mt-2 text-sm text-forest/60">{MARCA.direccion}</p>
                    <p className="mt-1 text-sm text-forest/60">WhatsApp {MARCA.whatsapp}</p>
                </div>
            </section>
        </div>
    )
}
