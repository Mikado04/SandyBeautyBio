import emblema from '../assets/emblema.png'
import { MARCA, VALORES, TIMELINE } from '../lib/marca'
import { useRevelar } from '../lib/revelar'

export default function Nosotros() {
    const refFoto = useRevelar()
    const refTexto = useRevelar()

    return (
        <section id="nosotros" className="bg-forest text-white">
            <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[minmax(0,420px)_1fr]">
                <div ref={refFoto} className="revelar-izq overflow-hidden rounded-3xl bg-[#f7f4ee] p-4">
                    <div className="rounded-2xl bg-white p-6">
                        <img
                            src={emblema}
                            alt={MARCA.razonSocial}
                            className="mx-auto w-full object-contain"
                        />
                    </div>

                    <div className="mt-4 rounded-2xl bg-forest-3 p-5">
                        <p className="titulo text-lg text-white">{MARCA.fundadora}</p>
                        <p className="mt-1 text-[10px] tracking-[0.18em] text-white/60 uppercase">
                            {MARCA.fundadoraRol}
                        </p>
                    </div>
                </div>

                <div ref={refTexto} className="revelar-der">
                    <p className="text-[10px] tracking-[0.2em] text-gold uppercase">
                        Nuestra historia
                    </p>

                    <h2 className="titulo mt-4 text-4xl lg:text-5xl">
                        De la finca familiar a la biocosmética certificada.
                    </h2>

                    <p className="mt-7 max-w-2xl leading-relaxed text-white/70">
                        Crecí entre moringa y cacao en Bioko. Mi abuela curaba con hojas. Estudié
                        biología para entender por qué funcionaba. En 2018 volví a Malabo con una
                        destiladora y un cuaderno. Hoy cultivamos 2ha sin pesticidas, prensamos en
                        frío y formulamos con norma ISO 22716. Sin greenwashing. Solo plantas que
                        conocemos por nombre.
                    </p>

                    <div className="mt-10 grid gap-4 sm:grid-cols-3">
                        {VALORES.map((v) => (
                            <div key={v.titulo} className="rounded-2xl bg-white/5 p-5">
                                <p className="titulo text-lg text-white">{v.titulo}</p>
                                <p className="mt-2 text-[13px] leading-relaxed text-white/60">
                                    {v.texto}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 border-t border-white/10 pt-8">
                        <p className="text-[10px] tracking-[0.2em] text-white/50 uppercase">
                            Timeline
                        </p>

                        <div className="mt-5 space-y-4">
                            {TIMELINE.map((t) => (
                                <div key={t.anio} className="flex gap-6">
                                    <span className="titulo w-14 shrink-0 text-gold">{t.anio}</span>
                                    <span className="text-sm text-white/80">{t.texto}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
