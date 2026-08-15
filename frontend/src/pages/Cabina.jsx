import { useState } from 'react'
import { SERVICIOS, MARCA, enlaceWhatsApp } from '../lib/marca'
import { formatPrice } from '../lib/format'

export default function Cabina() {
    const [servicio, setServicio] = useState(SERVICIOS[0].clave)
    const [nombre, setNombre] = useState('')
    const [telefono, setTelefono] = useState('')
    const [fecha, setFecha] = useState('')
    const [hora, setHora] = useState('10:00')
    const [notas, setNotas] = useState('')

    // La reservation part par WhatsApp : pas de compte, pas d'attente.
    function reservar(event) {
        event.preventDefault()

        const elegido = SERVICIOS.find((s) => s.clave === servicio)

        let mensaje = 'Hola, quiero reservar una cita en la cabina.\n\n'
        mensaje = mensaje + 'Servicio: ' + elegido.nombre + ' (' + elegido.duracion + ')\n'
        mensaje = mensaje + 'Nombre: ' + nombre + '\n'
        mensaje = mensaje + 'Teléfono: ' + telefono + '\n'
        mensaje = mensaje + 'Fecha: ' + fecha + ' a las ' + hora + '\n'

        if (notas) {
            mensaje = mensaje + 'Notas: ' + notas + '\n'
        }

        window.open(enlaceWhatsApp(mensaje), '_blank')
    }

    const champ =
        'mt-1 w-full border border-forest/20 bg-white px-4 py-3 text-sm text-forest outline-none focus:border-gold'

    return (
        <div>
            <section className="bg-forest text-cream">
                <div className="mx-auto max-w-6xl px-6 py-20">
                    <p className="text-[11px] tracking-[0.3em] text-gold uppercase">
                        Cabina Malabo · Solo con cita
                    </p>

                    <h1 className="font-display mt-5 text-4xl md:text-5xl">
                        Masajes con nuestros aceites
                    </h1>

                    <p className="mt-6 max-w-xl leading-relaxed text-cream/70">
                        Aceites tibios de nuestra destilación, sin prisa. De 60 a 90 minutos para
                        volver al cuerpo. Reserva directa, sin intermediarios.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-6 py-16">
                <div className="grid gap-6 md:grid-cols-3">
                    {SERVICIOS.map((s) => (
                        <Servicio
                            key={s.clave}
                            servicio={s}
                            elegido={servicio === s.clave}
                            onElegir={() => setServicio(s.clave)}
                        />
                    ))}
                </div>

                <div className="mt-16 grid gap-10 md:grid-cols-2">
                    <div>
                        <h2 className="font-display text-3xl text-forest">Reservar</h2>

                        <p className="mt-3 text-sm leading-relaxed text-forest/60">
                            Rellena el formulario y te abrimos WhatsApp con tu solicitud lista para
                            enviar. Te confirmamos la cita en menos de una hora.
                        </p>

                        <div className="mt-8 border-t border-gold pt-5 text-sm text-forest/70">
                            <p>{MARCA.direccion}</p>
                            <p className="mt-1">WhatsApp {MARCA.whatsapp}</p>
                        </div>
                    </div>

                    <form onSubmit={reservar} className="border border-forest/10 bg-white p-6">
                        <div>
                            <label className="text-[11px] tracking-widest text-forest/50 uppercase">
                                Nombre completo
                            </label>
                            <input
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                                className={champ}
                            />
                        </div>

                        <div className="mt-4">
                            <label className="text-[11px] tracking-widest text-forest/50 uppercase">
                                Teléfono WhatsApp
                            </label>
                            <input
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value)}
                                required
                                placeholder="+240 ..."
                                className={champ}
                            />
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[11px] tracking-widest text-forest/50 uppercase">
                                    Fecha
                                </label>
                                <input
                                    type="date"
                                    value={fecha}
                                    onChange={(e) => setFecha(e.target.value)}
                                    required
                                    className={champ}
                                />
                            </div>

                            <div>
                                <label className="text-[11px] tracking-widest text-forest/50 uppercase">
                                    Hora
                                </label>
                                <input
                                    type="time"
                                    value={hora}
                                    onChange={(e) => setHora(e.target.value)}
                                    required
                                    className={champ}
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="text-[11px] tracking-widest text-forest/50 uppercase">
                                Notas
                            </label>
                            <textarea
                                value={notas}
                                onChange={(e) => setNotas(e.target.value)}
                                rows="2"
                                placeholder="Preferencias, alergias, si es regalo..."
                                className={champ}
                            />
                        </div>

                        <button
                            type="submit"
                            className="mt-6 w-full bg-forest py-4 text-[11px] tracking-[0.2em] text-cream uppercase transition hover:bg-gold hover:text-forest"
                        >
                            Enviar por WhatsApp
                        </button>
                    </form>
                </div>
            </section>
        </div>
    )
}

function Servicio({ servicio, elegido, onElegir }) {
    let cadre = 'border border-forest/10 bg-white'

    if (elegido) {
        cadre = 'border border-gold bg-white shadow-[0_18px_40px_-24px_rgba(27,67,50,0.45)]'
    }

    return (
        <button onClick={onElegir} className={cadre + ' p-6 text-left transition'}>
            <p className="text-[10px] tracking-[0.25em] text-gold uppercase">
                {servicio.duracion}
            </p>

            <h3 className="font-display mt-3 text-xl text-forest">{servicio.nombre}</h3>

            <p className="mt-3 text-sm leading-relaxed text-forest/60">{servicio.texto}</p>

            <p className="font-display mt-5 text-2xl text-forest">
                {formatPrice(servicio.precio)}
            </p>
        </button>
    )
}
