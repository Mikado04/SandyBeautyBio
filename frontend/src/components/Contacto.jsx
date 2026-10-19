import { useState } from 'react'
import { MARCA, enlaceWhatsApp, enlaceTelefono, enlaceEmail, enlaceInstagram } from '../lib/marca'
import { useRevelar } from '../lib/revelar'

// Les coordonnees sont des liens : souligne discret, qui se renforce au survol
const CLASE_ENLACE =
    'underline decoration-forest/30 underline-offset-4 transition-colors hover:text-forest-3 hover:decoration-forest'

export default function Contacto() {
    const refDatos = useRevelar()
    const refFormulario = useRevelar()
    const [nombre, setNombre] = useState('')
    const [email, setEmail] = useState('')
    const [telefono, setTelefono] = useState('')
    const [mensaje, setMensaje] = useState('')

    // Pas de boite mail branchee : le message part par WhatsApp
    function enviar(event) {
        event.preventDefault()

        let texto = 'Hola Sandy Beauty,\n\n'
        texto = texto + 'Nombre: ' + nombre + '\n'
        texto = texto + 'Email: ' + email + '\n'
        texto = texto + 'Teléfono: ' + telefono + '\n\n'
        texto = texto + mensaje

        window.open(enlaceWhatsApp(texto), '_blank')
    }

    const campo =
        'w-full rounded-full border border-forest/10 bg-cream px-5 py-3.5 text-sm text-forest outline-none placeholder:text-muted/70 focus:border-gold'

    return (
        <section id="contacto" className="bg-[#f5f1eb]">
            <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2">
                <div ref={refDatos} className="revelar-izq">
                    <h2 className="titulo max-w-md text-4xl text-forest lg:text-5xl">
                        Ven a oler la selva. Estamos en Buena Esperanza.
                    </h2>

                    <div className="mt-9 space-y-4 text-sm text-forest">
                        <Linea icono={<IconoPin />}>
                            {MARCA.direccion}
                            <br />
                            <span className="text-muted">{MARCA.horario}</span>
                        </Linea>

                        <Linea icono={<IconoTel />}>
                            <a href={enlaceTelefono(MARCA.telefono1)} className={CLASE_ENLACE}>
                                {MARCA.telefono1}
                            </a>
                            {' / '}
                            <a href={enlaceTelefono(MARCA.telefono2)} className={CLASE_ENLACE}>
                                {MARCA.telefono2}
                            </a>
                        </Linea>

                        <Linea icono={<IconoMail />}>
                            <a href={enlaceEmail(MARCA.email)} className={CLASE_ENLACE}>
                                {MARCA.email}
                            </a>
                        </Linea>

                        <Linea icono={<IconoInsta />}>
                            <a href={enlaceInstagram(MARCA.instagram)} target="_blank" rel="noreferrer" className={CLASE_ENLACE}>
                                {MARCA.instagram}
                            </a>
                        </Linea>
                    </div>

                    <div className="mt-10 rounded-3xl bg-white p-4">
                        <div className="flex flex-col items-center justify-center rounded-2xl bg-[#eceadf] py-16">
                            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-forest">
                                <IconoPin blanco />
                            </span>
                            <p className="titulo mt-4 text-lg text-forest">Malabo · Bioko Norte</p>
                            <p className="mt-1 text-[10px] tracking-[0.18em] text-muted uppercase">
                                Entrega moto 24h
                            </p>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-cream px-5 py-3.5">
                            <span className="text-[10px] tracking-[0.18em] text-forest uppercase">
                                Envío
                            </span>
                            <span className="text-[13px] text-muted">
                                Malabo 1 500 XAF · Bata 5 000 XAF
                            </span>
                        </div>
                    </div>
                </div>

                <form
                    ref={refFormulario}
                    onSubmit={enviar}
                    className="revelar-der rounded-3xl bg-white p-8"
                >
                    <p className="flex items-center gap-2 text-[10px] tracking-[0.18em] text-muted uppercase">
                        <IconoCorazon />
                        Escríbenos · Respuesta &lt;4h
                    </p>

                    <h3 className="titulo mt-3 text-2xl text-forest">
                        ¿Duda de piel? Te asesoramos sin vender de más.
                    </h3>

                    <div className="mt-7 grid gap-4 sm:grid-cols-2">
                        <input
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                            placeholder="Nombre"
                            className={campo}
                        />
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            placeholder="Email"
                            className={campo}
                        />
                    </div>

                    <input
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        required
                        placeholder="Teléfono WhatsApp"
                        className={campo + ' mt-4'}
                    />

                    <textarea
                        value={mensaje}
                        onChange={(e) => setMensaje(e.target.value)}
                        required
                        rows="4"
                        placeholder="Cuéntanos tu tipo de piel, rutina actual, qué buscas..."
                        className="mt-4 w-full rounded-3xl border border-forest/10 bg-cream px-5 py-4 text-sm text-forest outline-none placeholder:text-muted/70 focus:border-gold"
                    />

                    <button
                        type="submit"
                        className="mt-6 rounded-full bg-forest px-8 py-4 text-[11px] font-medium tracking-[0.15em] text-white uppercase transition hover:bg-forest-2"
                    >
                        Enviar mensaje
                    </button>
                </form>
            </div>
        </section>
    )
}

function Linea({ icono, children }) {
    return (
        <div className="flex items-start gap-3">
            <span className="mt-0.5 shrink-0 text-forest-3">{icono}</span>
            <span>{children}</span>
        </div>
    )
}

function IconoPin({ blanco }) {
    let couleur = 'text-forest-3'

    if (blanco) {
        couleur = 'text-white'
    }

    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={couleur}>
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    )
}

function IconoTel() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
        </svg>
    )
}

function IconoMail() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m2 7 10 6 10-6" />
        </svg>
    )
}

function IconoInsta() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
        </svg>
    )
}

function IconoCorazon() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z" />
        </svg>
    )
}
