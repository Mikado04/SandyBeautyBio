import { SERVICIOS } from '../lib/marca'
import { formatPrice } from '../lib/format'
import { useRevelar } from '../lib/revelar'

export default function Masajes({ onReservar }) {
    const refCabecera = useRevelar()
    const refTarjetas = useRevelar()
    return (
        <section id="masajes" className="bg-[#f0ebe1]">
            <div className="mx-auto max-w-7xl px-6 py-20">
                <div ref={refCabecera} className="revelar">
                    <p className="text-[10px] tracking-[0.2em] text-muted uppercase">
                        Cabina Malabo · Solo con cita
                    </p>

                    <h2 className="titulo mt-3 max-w-2xl text-4xl text-forest lg:text-5xl">
                        Masajes de selva. Manos que conocen las plantas.
                    </h2>

                    <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted">
                        Aceites tibios de nuestra destilación, sin prisa. 60 a 90 minutos para
                        volver al cuerpo. Reserva directa, sin intermediarios.
                    </p>
                </div>

                <div ref={refTarjetas} className="revelar-grupo mt-12 grid gap-6 lg:grid-cols-3">
                    {SERVICIOS.map((s, i) => (
                        <div
                            key={s.clave}
                            style={{ transitionDelay: i * 110 + 'ms' }}
                            className="revelar elevar flex flex-col rounded-2xl bg-white p-7 shadow-[0_25px_55px_-45px_rgba(27,67,50,0.6)]"
                        >
                            <div className="flex items-start justify-between">
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream">
                                    <IconoGota />
                                </span>

                                <span className="rounded-full bg-cream px-3 py-1.5 text-[9px] font-medium tracking-[0.12em] text-muted uppercase">
                                    {s.duracion}
                                </span>
                            </div>

                            <h3 className="titulo mt-6 text-2xl text-forest">{s.nombre}</h3>

                            <p className="mt-3 text-[13px] leading-relaxed text-muted">{s.texto}</p>

                            <ul className="mt-6 flex-1 space-y-2.5">
                                {s.incluye.map((i) => (
                                    <li key={i} className="flex items-start gap-3 text-[13px] text-forest">
                                        <Check />
                                        {i}
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-7 flex items-center justify-between gap-3">
                                <span className="titulo text-xl text-forest">
                                    {formatPrice(s.precio)}
                                </span>

                                <button
                                    onClick={() => onReservar(s.clave)}
                                    className="rounded-full bg-forest px-6 py-2.5 text-[10px] font-medium tracking-[0.12em] text-white uppercase transition hover:bg-forest-2"
                                >
                                    Reservar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

function IconoGota() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-forest"
        >
            <path d="M12 2.5S6 9.5 6 14a6 6 0 0 0 12 0c0-4.5-6-11.5-6-11.5z" />
        </svg>
    )
}

function Check() {
    return (
        <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="mt-1 shrink-0 text-forest-3"
        >
            <path d="M20 6 9 17l-5-5" />
        </svg>
    )
}
