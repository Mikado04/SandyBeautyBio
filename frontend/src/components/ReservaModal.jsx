import { useState } from 'react'
import { SERVICIOS, enlaceWhatsApp } from '../lib/marca'
import { formatPrice } from '../lib/format'

// Creneaux proposes : de 9h a 18h, toutes les heures
const HORAS = [
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
]

// La fenetre n'est affichee que lorsqu'elle est ouverte : elle repart donc
// toujours d'un etat neuf, avec le service choisi au depart.
export default function ReservaModal({ servicioInicial, onClose }) {
    let servicioDePartida = SERVICIOS[0].clave

    if (servicioInicial) {
        servicioDePartida = servicioInicial
    }

    const [servicio, setServicio] = useState(servicioDePartida)
    const [fecha, setFecha] = useState('')
    const [hora, setHora] = useState('10:00')
    const [nombre, setNombre] = useState('')
    const [telefono, setTelefono] = useState('')
    const [email, setEmail] = useState('')
    const [notas, setNotas] = useState('')

    const elegido = SERVICIOS.find((s) => s.clave === servicio)

    function confirmar(event) {
        event.preventDefault()

        let mensaje = 'Hola Sandy Beauty, quiero reservar una cita.\n\n'
        mensaje = mensaje + 'Servicio: ' + elegido.nombre + ' (' + elegido.duracion + ')\n'
        mensaje = mensaje + 'Total: ' + formatPrice(elegido.precio) + '\n'
        mensaje = mensaje + 'Fecha: ' + fecha + ' a las ' + hora + '\n\n'
        mensaje = mensaje + 'Nombre: ' + nombre + '\n'
        mensaje = mensaje + 'WhatsApp: ' + telefono + '\n'

        if (email) {
            mensaje = mensaje + 'Email: ' + email + '\n'
        }

        if (notas) {
            mensaje = mensaje + '\nNotas: ' + notas + '\n'
        }

        window.open(enlaceWhatsApp(mensaje), '_blank')
        onClose()
    }

    function filaClass(clave) {
        if (servicio === clave) {
            return 'w-full rounded-2xl bg-forest p-5 text-left text-white transition'
        }

        return 'w-full rounded-2xl bg-white p-5 text-left transition hover:bg-white/70'
    }

    const campo =
        'w-full rounded-2xl border border-forest/10 bg-cream px-5 py-3.5 text-sm text-forest outline-none placeholder:text-muted/70 focus:border-gold'

    return (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
            <button
                onClick={onClose}
                className="aparecer absolute inset-0 bg-forest/40 backdrop-blur-[2px]"
                aria-label="Cerrar"
            />

            <div className="aparecer-zoom relative grid max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl lg:grid-cols-2">
                {/* Colonne gauche : le choix du rituel */}
                <div className="bg-[#f7f4ee] p-8">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-[10px] tracking-[0.2em] text-muted uppercase">
                                Reservar masaje
                            </p>
                            <h2 className="titulo mt-2 text-3xl text-forest">Elige tu ritual</h2>
                        </div>

                        <button
                            onClick={onClose}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-xl leading-none text-muted transition hover:text-forest"
                            aria-label="Cerrar"
                        >
                            ×
                        </button>
                    </div>

                    <div className="mt-6 space-y-3">
                        {SERVICIOS.map((s) => (
                            <button
                                key={s.clave}
                                type="button"
                                onClick={() => setServicio(s.clave)}
                                className={filaClass(s.clave)}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="text-[15px] font-medium">
                                            {s.nombre} • {s.duracion}
                                        </p>
                                        <p className="mt-1.5 text-[13px] leading-relaxed opacity-70">
                                            {s.texto}
                                        </p>
                                    </div>

                                    <span className="titulo shrink-0 text-right text-lg">
                                        {formatPrice(s.precio)}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>

                    <p className="mt-7 text-[10px] tracking-[0.2em] text-muted uppercase">
                        Fecha y hora
                    </p>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <input
                            type="date"
                            value={fecha}
                            onChange={(e) => setFecha(e.target.value)}
                            required
                            form="reserva"
                            className={campo + ' bg-white'}
                        />

                        <select
                            value={hora}
                            onChange={(e) => setHora(e.target.value)}
                            form="reserva"
                            className={campo + ' bg-white'}
                        >
                            {HORAS.map((h) => (
                                <option key={h} value={h}>
                                    {h}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Colonne droite : les coordonnees */}
                <form id="reserva" onSubmit={confirmar} className="p-8">
                    <h2 className="titulo text-3xl text-forest">Tus datos</h2>

                    <div className="mt-6 space-y-3">
                        <input
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                            placeholder="Nombre completo"
                            className={campo}
                        />

                        <input
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
                            required
                            placeholder="WhatsApp +240 ..."
                            className={campo}
                        />

                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            placeholder="Email"
                            className={campo}
                        />

                        <textarea
                            value={notas}
                            onChange={(e) => setNotas(e.target.value)}
                            rows="3"
                            placeholder="Preferencias, alergias, si es regalo..."
                            className={campo}
                        />
                    </div>

                    <div className="mt-6 rounded-2xl bg-cream p-5">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted">Servicio</span>
                            <span className="font-medium text-forest">{elegido.nombre}</span>
                        </div>

                        <div className="mt-2 flex justify-between text-sm">
                            <span className="text-muted">Duración</span>
                            <span className="text-forest">{elegido.duracion}</span>
                        </div>

                        <div className="mt-4 flex items-baseline justify-between border-t border-forest/10 pt-4">
                            <span className="titulo text-lg text-forest">Total</span>
                            <span className="titulo text-xl text-forest">
                                {formatPrice(elegido.precio)}
                            </span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="mt-6 w-full rounded-full bg-forest py-4 text-[11px] font-medium tracking-[0.18em] text-white uppercase transition hover:bg-forest-2"
                    >
                        Confirmar reserva
                    </button>

                    <p className="mt-4 text-center text-[11px] text-muted">
                        Te contactamos por WhatsApp en menos de 1h
                    </p>
                </form>
            </div>
        </div>
    )
}
