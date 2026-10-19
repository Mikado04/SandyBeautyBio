import { useEffect, useState } from 'react'
import api from '../lib/api'
import { formatPrice } from '../lib/format'
import { MARCA, CERTIFICACIONES, VALORES, enlaceWhatsApp } from '../lib/marca'
import { chargerKkiapay, ouvrirKkiapay } from '../lib/kkiapay'
import emblema from '../assets/emblema.png'

// Page "Finalizar pedido".
// Design : canevas Claude Design "Sandy Beauty — Tunnel de paiement", onglet "Finalizar pedido".
// Animations : classes CSS de index.css (entrada, deslizar-izquierda, sello-aparecer, elevar-boton).

// Or fonce : l'or de la marque (#c9a86a) est trop clair pour du petit texte sur fond creme
const ORO_TEXTO = 'text-[#8a6d35]'

// Classes communes a tous les champs du formulaire
const CLASES_CAMPO =
    'mt-2 h-[52px] w-full rounded-2xl border border-forest/10 bg-[#f7f4ee] px-[18px] text-base text-forest outline-none placeholder:text-[#8a978f] focus:border-gold focus:bg-white'

const CLASES_ETIQUETA = 'text-[11px] tracking-[0.14em] text-[#5a6b61] uppercase'

export default function Checkout({ cart, total, onSuccess, onBack }) {
    const [methods, setMethods] = useState([])
    const [method, setMethod] = useState('')

    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [city, setCity] = useState('Malabo')
    const [address, setAddress] = useState('')
    const [notes, setNotes] = useState('')

    const [sending, setSending] = useState(false)
    const [error, setError] = useState(null)
    const [fieldErrors, setFieldErrors] = useState({})

    // Commande Kkiapay deja creee, en attente de paiement dans la fenetre.
    // Tant qu'elle existe, on n'en cree pas une deuxieme : on rouvre la fenetre.
    const [pedidoKkiapay, setPedidoKkiapay] = useState(null)

    useEffect(() => {
        api.get('/api/payment-methods')
            .then((res) => {
                setMethods(res.data.data)

                if (res.data.data.length > 0) {
                    setMethod(res.data.data[0].key)
                }
            })
            .catch(() => setError('No se pudieron cargar los medios de pago.'))
    }, [])

    function submit(event) {
        event.preventDefault()

        setSending(true)
        setError(null)
        setFieldErrors({})

        // On n'envoie que l'identifiant et la quantite : jamais le prix
        const items = []

        for (const ligne of cart) {
            items.push({ product_id: ligne.product.id, quantity: ligne.quantity })
        }

        api.post('/api/orders', {
            customer_name: name,
            customer_phone: phone,
            customer_email: email,
            customer_city: city,
            customer_address: address,
            notes: notes,
            payment_method: method,
            items: items,
        })
            .then((res) => {
                // Paiement par redirection : on quitte le site
                if (res.data.payment.type === 'redirect') {
                    window.location.href = res.data.payment.url
                    return
                }

                // Paiement par carte (Kkiapay) : fenetre ouverte sur le site
                if (res.data.payment.type === 'widget') {
                    setPedidoKkiapay(res.data)
                    abrirVentanaKkiapay(res.data)
                    window.scrollTo(0, 0)
                    return
                }

                onSuccess(res.data)
            })
            .catch((err) => {
                setSending(false)

                if (err.response && err.response.status === 422) {
                    setError(err.response.data.message)

                    if (err.response.data.errors) {
                        setFieldErrors(err.response.data.errors)
                    }

                    return
                }

                // 502 : la commande a ete annulee car le prestataire a refuse la transaction.
                // On affiche le message precis renvoye par l'API.
                if (err.response && err.response.status === 502 && err.response.data.message) {
                    setError(err.response.data.message)
                    return
                }

                setError('No se pudo registrar el pedido. Inténtalo de nuevo.')
            })
    }

    // Ouvre (ou rouvre) la fenetre Kkiapay pour une commande deja creee
    function abrirVentanaKkiapay(pedido) {
        setSending(true)
        setError(null)

        chargerKkiapay()
            .then(function () {
                setSending(false)
                ouvrirKkiapay(
                    pedido,
                    function (idTransaccion) {
                        irAlResultado(pedido.reference, idTransaccion)
                    },
                    function () {
                        setError('El pago no se ha completado. Puedes intentarlo de nuevo.')
                    }
                )
            })
            .catch(function () {
                setSending(false)
                setError('No se pudo abrir la ventana de pago. Comprueba tu conexión e inténtalo de nuevo.')
            })
    }

    // Paiement termine dans la fenetre : on part sur la page de retour.
    // Elle demandera au backend de VERIFIER la transaction aupres de Kkiapay.
    function irAlResultado(referencia, idTransaccion) {
        window.location.href =
            '/?pedido=' +
            encodeURIComponent(referencia) +
            '&transaction_id=' +
            encodeURIComponent(idTransaccion)
    }

    function errorFor(champ) {
        if (!fieldErrors[champ]) {
            return null
        }

        return <p className="mt-1.5 text-xs text-red-700">{fieldErrors[champ][0]}</p>
    }

    // ---- Panier vide ----
    if (cart.length === 0 && !pedidoKkiapay) {
        return (
            <Marco onBack={onBack}>
                <div className="flex justify-center px-6 py-24">
                    <div className="entrada w-full max-w-[520px] rounded-[32px] bg-white px-8 py-14 text-center shadow-[0_30px_60px_-34px_rgba(27,67,50,0.35)]">
                        <img src={emblema} alt="" className="mx-auto h-20 w-20 object-contain" />
                        <h1 className="titulo mt-6 text-4xl text-forest">El carrito está vacío</h1>
                        <p className="mt-4 text-[15px] leading-relaxed text-[#4d5e55]">
                            Descubre nuestras fórmulas hechas a mano en Malabo.
                        </p>
                        <button onClick={onBack} className={'mt-8 ' + CLASES_BOTON}>
                            Volver a la tienda
                        </button>
                    </div>
                </div>
            </Marco>
        )
    }

    // Le moyen choisi, pour adapter la note de devise et le texte du bouton
    let metodoElegido = null

    for (const m of methods) {
        if (m.key === method) {
            metodoElegido = m
        }
    }

    // Version condensee possible :
    // const metodoElegido = methods.find((m) => m.key === method) ?? null
    // find() s'arrete au premier element trouve, sans parcourir toute la liste.

    let textoBoton = 'Confirmar pedido'

    if (method === 'kkiapay' || method === 'fedapay') {
        textoBoton = 'Confirmar y pagar · ' + formatPrice(total)
    }

    return (
        <Marco onBack={onBack} conHoja>
            {/* Titre */}
            <div className="relative mx-auto flex max-w-[1160px] flex-col gap-3 px-6 pt-12 pb-6 sm:pt-14">
                <p className={'entrada text-[11px] font-semibold tracking-[0.26em] uppercase ' + ORO_TEXTO}>
                    Finalizar pedido
                </p>
                <h1 className="entrada titulo text-[38px] leading-[1.05] text-forest sm:text-[52px]" style={{ animationDelay: '0.1s' }}>
                    Tu ritual, <em className="text-forest-3">a un paso</em>
                </h1>
                <p className="entrada max-w-[560px] text-[15.5px] leading-relaxed text-[#4d5e55]" style={{ animationDelay: '0.2s' }}>
                    Biocosmética certificada, cultivada y fabricada a mano en Malabo. Completa tus
                    datos y te lo preparamos hoy mismo.
                </p>
            </div>

            {/* Sur telephone : recapitulatif, formulaire, puis l'entreprise.
                Sur ordinateur : formulaire a gauche, recapitulatif et entreprise a droite. */}
            <div className="relative mx-auto grid max-w-[1160px] items-start gap-6 px-6 pb-20 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-8">
                <div className="deslizar-izquierda lg:col-start-2 lg:row-start-1">
                    <Resumen cart={cart} total={total} pedidoKkiapay={pedidoKkiapay} />
                </div>

                <div className="flex min-w-0 flex-col gap-5 lg:col-start-1 lg:row-span-2 lg:row-start-1">
                    {error && (
                        <p className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                            {error}
                        </p>
                    )}

                    {pedidoKkiapay && (
                        <PagarConTarjeta
                            pedido={pedidoKkiapay}
                            sending={sending}
                            onPagar={() => abrirVentanaKkiapay(pedidoKkiapay)}
                            name={name}
                            phone={phone}
                            city={city}
                            address={address}
                        />
                    )}

                    {!pedidoKkiapay && (
                        <form onSubmit={submit} className="flex flex-col gap-5">
                            {/* 01 · Datos de entrega */}
                            <section className="rounded-[28px] bg-white p-6 shadow-[0_24px_50px_-36px_rgba(27,67,50,0.35)] sm:p-8">
                                <TituloSeccion numero="01" texto="Tus datos de entrega" />

                                <div className="grid gap-[18px] sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <label htmlFor="c-nombre" className={CLASES_ETIQUETA}>
                                            Nombre y apellidos *
                                        </label>
                                        <input id="c-nombre" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={CLASES_CAMPO} />
                                        {errorFor('customer_name')}
                                    </div>

                                    <div>
                                        <label htmlFor="c-tel" className={CLASES_ETIQUETA}>
                                            Teléfono WhatsApp *
                                        </label>
                                        <input id="c-tel" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+240 ..." autoComplete="tel" className={CLASES_CAMPO} />
                                        {errorFor('customer_phone')}
                                    </div>

                                    <div>
                                        <label htmlFor="c-mail" className={CLASES_ETIQUETA}>
                                            Correo electrónico
                                        </label>
                                        <input id="c-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" autoComplete="email" className={CLASES_CAMPO} />
                                        {errorFor('customer_email')}
                                    </div>

                                    <div>
                                        <label htmlFor="c-ciudad" className={CLASES_ETIQUETA}>
                                            Ciudad *
                                        </label>
                                        <input id="c-ciudad" value={city} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2" className={CLASES_CAMPO} />
                                        {errorFor('customer_city')}
                                    </div>

                                    <div>
                                        <label htmlFor="c-dir" className={CLASES_ETIQUETA}>
                                            Dirección de entrega *
                                        </label>
                                        <input id="c-dir" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Barrio, calle, referencia" autoComplete="street-address" className={CLASES_CAMPO} />
                                        {errorFor('customer_address')}
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="c-notas" className={CLASES_ETIQUETA}>
                                            Notas (opcional)
                                        </label>
                                        <textarea
                                            id="c-notas"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            rows="2"
                                            placeholder="Horario preferido, indicaciones para el repartidor…"
                                            className="mt-2 w-full rounded-2xl border border-forest/10 bg-[#f7f4ee] px-[18px] py-3.5 text-base text-forest outline-none placeholder:text-[#8a978f] focus:border-gold focus:bg-white"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* 02 · Medio de pago */}
                            <section className="rounded-[28px] bg-white p-6 shadow-[0_24px_50px_-36px_rgba(27,67,50,0.35)] sm:p-8">
                                <TituloSeccion numero="02" texto="Medio de pago" />

                                <div className="flex flex-col gap-3">
                                    {methods.map((m) => (
                                        <TarjetaMetodo
                                            key={m.key}
                                            metodo={m}
                                            elegido={method === m.key}
                                            onElegir={() => setMethod(m.key)}
                                        />
                                    ))}
                                </div>
                                {errorFor('payment_method')}

                                <NotaPago metodo={metodoElegido} />
                            </section>

                            <button type="submit" disabled={sending || methods.length === 0} className={CLASES_BOTON + ' h-[60px] text-[12.5px]'}>
                                <IconoCandado />
                                {textoBoton}
                            </button>
                            <p className="text-center text-xs text-[#5a6b61]">
                                Entrega en Malabo en 24 h · Te confirmamos el pedido por WhatsApp
                            </p>
                        </form>
                    )}
                </div>

                <div className="lg:col-start-2 lg:row-start-2">
                    <HechoEnMalabo />
                </div>
            </div>
        </Marco>
    )
}

// ------------------------------------------------------------------
// Les morceaux de la page
// ------------------------------------------------------------------

// Bouton vert plein, utilise partout sur la page
const CLASES_BOTON =
    'elevar-boton inline-flex min-h-[52px] w-full items-center justify-center gap-3 rounded-full bg-forest px-7 text-xs font-medium tracking-[0.16em] text-white uppercase shadow-[0_18px_30px_-18px_rgba(27,67,50,0.7)] hover:bg-forest-2 disabled:bg-forest/30 disabled:shadow-none'

// En-tete avec le fil d'etapes, fond creme et pied de page
function Marco({ children, onBack, conHoja }) {
    return (
        <div className="flex min-h-screen flex-col bg-[#f7f4ee] text-forest">
            <header className="border-b border-forest/10 bg-[#fdfbf7]">
                <div className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-between gap-4 px-6 py-4">
                    <div className="flex items-center gap-3.5">
                        <img src={emblema} alt="Sandy Beauty" className="h-12 w-12 object-contain" />
                        <div className="flex flex-col gap-0.5">
                            <span className="titulo text-[22px] leading-none">{MARCA.nombre}</span>
                            <span className="text-[10px] tracking-[0.22em] text-[#5a6b61] uppercase">
                                Biocosmética · Malabo
                            </span>
                        </div>
                    </div>

                    <ol aria-label="Etapas del pedido" className="order-3 flex w-full items-center justify-center gap-3 text-xs md:order-none md:w-auto">
                        <li className="flex items-center gap-2 text-[#5a6b61]">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest">
                                <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c9a86a" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                                </svg>
                            </span>
                            Carrito
                        </li>
                        <li aria-hidden="true" className="h-px w-7 bg-forest/25" />
                        <li aria-current="step" className="flex items-center gap-2 font-semibold">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold text-[11px]">2</span>
                            Datos y pago
                        </li>
                        <li aria-hidden="true" className="h-px w-7 bg-forest/25" />
                        <li className="flex items-center gap-2 text-[#6f7c75]">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] shadow-[inset_0_0_0_1px_rgba(27,67,50,0.25)]">3</span>
                            Confirmación
                        </li>
                    </ol>

                    <button onClick={onBack} className="boton-contorno">
                        <IconoVolver />
                        Volver a la tienda
                    </button>
                </div>
            </header>

            <main className="relative flex-1 overflow-hidden">
                {conHoja && <HojaDecorativa />}
                {children}
            </main>

            <footer className="bg-forest text-white/75">
                <div className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-between gap-3 px-6 py-6 text-xs">
                    <span>
                        {MARCA.razonSocial} · {MARCA.direccion}
                    </span>
                    <span className="text-[10px] tracking-[0.18em] text-gold uppercase">
                        Sandy Natur · Bella Ecuatoguineana Bio
                    </span>
                </div>
            </footer>
        </div>
    )
}

function TituloSeccion({ numero, texto }) {
    return (
        <div className="mb-6 flex items-center gap-3.5">
            <span className={'titulo text-[26px] ' + ORO_TEXTO}>{numero}</span>
            <h2 className="text-lg font-medium text-forest">{texto}</h2>
        </div>
    )
}

// Une tuile de moyen de paiement (bouton radio cache derriere toute la tuile)
function TarjetaMetodo({ metodo, elegido, onElegir }) {
    let clases =
        'flex cursor-pointer items-center gap-4 rounded-[20px] bg-[#fdfbf7] p-4 motion-safe:transition-shadow sm:gap-[18px] sm:px-[22px] sm:py-5'

    if (elegido) {
        clases = clases + ' shadow-[inset_0_0_0_1.5px_#c9a86a]'
    } else {
        clases = clases + ' shadow-[inset_0_0_0_1px_rgba(27,67,50,0.12)] hover:shadow-[inset_0_0_0_1px_#c9a86a]'
    }

    // Petit texte sous le nom du moyen de paiement
    let detalle = ''

    if (metodo.key === 'kkiapay') {
        detalle = 'Pago seguro en la ventana de Kkiapay'
    }

    if (metodo.key === 'fedapay') {
        detalle = 'MTN, Moov, Wave… · países de África Occidental'
    }

    if (metodo.key === 'bank_transfer') {
        detalle = 'Te damos los datos bancarios al confirmar'
    }

    return (
        <label className={clases}>
            <input
                type="radio"
                name="payment_method"
                value={metodo.key}
                checked={elegido}
                onChange={onElegir}
                className="h-5 w-5 flex-none accent-forest"
            />
            <span className="flex h-12 w-12 flex-none items-center justify-center rounded-[14px] bg-forest sm:h-[52px] sm:w-[52px]">
                <IconoMetodo clave={metodo.key} />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-[15px] font-medium text-forest sm:text-base">{metodo.label}</span>
                <span className="text-[12.5px] text-[#5a6b61]">{detalle}</span>
            </span>
            {metodo.key === 'kkiapay' && (
                <span className="hidden gap-1.5 sm:flex">
                    <span className="rounded-md bg-white px-2 py-1 text-[10.5px] font-semibold tracking-[0.08em] shadow-[inset_0_0_0_1px_rgba(27,67,50,0.15)]">VISA</span>
                    <span className="rounded-md bg-white px-2 py-1 text-[10.5px] font-semibold tracking-[0.04em] shadow-[inset_0_0_0_1px_rgba(27,67,50,0.15)]">MASTERCARD</span>
                </span>
            )}
            {metodo.key !== 'kkiapay' && (
                <span className="text-[11px] font-medium text-[#5a6b61]">{metodo.currency}</span>
            )}
        </label>
    )
}

function IconoMetodo({ clave }) {
    // Carte bancaire
    if (clave === 'kkiapay') {
        return (
            <svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#c9a86a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
                <path d="M3 10h18" />
                <path d="M7 15h3" />
            </svg>
        )
    }

    // Telephone (Mobile Money)
    if (clave === 'fedapay') {
        return (
            <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c9a86a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
                <path d="M11 18.5h2" />
            </svg>
        )
    }

    // Banque (virement)
    return (
        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c9a86a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9.5L12 4l9 5.5" />
            <path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8" />
            <path d="M3 20.5h18" />
        </svg>
    )
}

// Note sous les moyens de paiement : securite de la carte et devise XOF
function NotaPago({ metodo }) {
    if (!metodo) {
        return null
    }

    let texto = ''

    if (metodo.key === 'kkiapay') {
        texto = 'Tus datos de tarjeta nunca pasan por nuestra web. '
    }

    if (metodo.currency === 'XOF') {
        texto =
            texto +
            'El cobro se realiza en francos CFA de África Occidental (XOF), con exactamente el mismo valor que el XAF.'
    }

    if (texto === '') {
        return null
    }

    return (
        <div className="mt-4 flex items-start gap-3 rounded-2xl bg-[#f7f4ee] px-4 py-3.5 text-[12.5px] leading-relaxed text-[#4d5e55]">
            <IconoCandado color="#8a6d35" />
            <span>{texto}</span>
        </div>
    )
}

// Recapitulatif vert : produits et total
function Resumen({ cart, total, pedidoKkiapay }) {
    // Commande deja creee : le paiement se fait en XOF (meme valeur que le XAF)
    let divisaTotal = 'XAF'

    if (pedidoKkiapay) {
        divisaTotal = pedidoKkiapay.currency
    }

    return (
        <section className="rounded-[28px] bg-forest p-6 text-white sm:p-7">
            <div className="flex items-center justify-between">
                <span className="text-[10px] tracking-[0.24em] text-gold uppercase">Tu pedido</span>
                <span className="text-xs text-white/70">
                    {cart.length} {cart.length === 1 ? 'producto' : 'productos'}
                </span>
            </div>

            <div className="mt-5 flex flex-col gap-4">
                {cart.map((ligne) => (
                    <LineaProducto key={ligne.product.id} ligne={ligne} />
                ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 border-t border-white/15 pt-5 text-[13.5px]">
                <div className="flex justify-between gap-3">
                    <span className="text-white/70">Subtotal</span>
                    <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between gap-3">
                    <span className="text-white/70">Entrega</span>
                    <span>Malabo · 24 h</span>
                </div>
            </div>

            <div className="mt-5 flex items-baseline justify-between gap-3 border-t border-dashed border-gold/45 pt-5">
                <span className="text-[10.5px] tracking-[0.22em] text-white/70 uppercase">Total</span>
                <span className="titulo text-[36px] leading-none sm:text-[38px]">
                    {new Intl.NumberFormat('fr-FR').format(total)}{' '}
                    <span className="font-sans text-[15px] text-gold">{divisaTotal}</span>
                </span>
            </div>
        </section>
    )
}

function LineaProducto({ ligne }) {
    // Pas encore de photo pour les produits : l'embleme les remplace
    let imagen = <img src={emblema} alt="" className="h-11 w-11 object-contain" />

    if (ligne.product.image_url) {
        imagen = <img src={ligne.product.image_url} alt="" className="h-full w-full object-cover" />
    }

    return (
        <div className="flex items-center gap-3.5">
            <span className="flex h-[60px] w-[60px] flex-none items-center justify-center overflow-hidden rounded-2xl bg-[#f7f4ee]">
                {imagen}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-[15px] font-medium">{ligne.product.name}</span>
                <span className="text-xs text-white/65">Cantidad: {ligne.quantity}</span>
            </span>
            <span className="titulo flex-none text-lg">
                {formatPrice(ligne.product.price * ligne.quantity)}
            </span>
        </div>
    )
}

// Ecran affiche quand la commande Kkiapay est creee : on paie (ou on rouvre la fenetre)
function PagarConTarjeta({ pedido, sending, onPagar, name, phone, city, address }) {
    return (
        <>
            <section className="flex flex-col items-center gap-[18px] rounded-[32px] bg-white px-6 py-12 text-center shadow-[0_30px_60px_-34px_rgba(27,67,50,0.35)] sm:px-11">
                <div className="sello-aparecer flex h-[88px] w-[88px] items-center justify-center rounded-full bg-forest shadow-[0_0_0_7px_#ffffff,0_0_0_8px_#c9a86a]">
                    <IconoMetodo clave="kkiapay" />
                </div>
                <p className={'text-[11px] font-semibold tracking-[0.26em] uppercase ' + ORO_TEXTO}>
                    Pedido {pedido.reference} registrado
                </p>
                <h1 className="titulo text-[36px] leading-[1.08] text-forest sm:text-[44px]">
                    Completa el pago <em className="text-forest-3">con tarjeta</em>
                </h1>
                <p className="max-w-[440px] text-[15px] leading-relaxed text-[#4d5e55]">
                    Tu pedido está reservado. Introduce los datos de tu tarjeta en la ventana segura
                    de Kkiapay para terminar.
                </p>

                <button type="button" disabled={sending} onClick={onPagar} className={CLASES_BOTON + ' mt-2 h-[60px] max-w-[380px] text-[12.5px]'}>
                    <IconoCandado />
                    Pagar {formatPrice(pedido.total, pedido.currency)}
                </button>

                <div className="flex flex-wrap items-center justify-center gap-2">
                    <span className="rounded-md px-2 py-1 text-[10.5px] font-semibold tracking-[0.08em] shadow-[inset_0_0_0_1px_rgba(27,67,50,0.15)]">VISA</span>
                    <span className="rounded-md px-2 py-1 text-[10.5px] font-semibold tracking-[0.04em] shadow-[inset_0_0_0_1px_rgba(27,67,50,0.15)]">MASTERCARD</span>
                    <span className="px-2 py-1 text-[11.5px] text-[#5a6b61]">Pago seguro con Kkiapay</span>
                </div>

                <p className="mt-1.5 rounded-2xl bg-[#f7f4ee] px-[18px] py-3.5 text-[13px] leading-relaxed text-[#4d5e55]">
                    ¿Cerraste la ventana sin pagar? Pulsa de nuevo{' '}
                    <b className="font-semibold text-forest">Pagar</b>: tu pedido sigue reservado, no
                    se crea otro.
                </p>
            </section>

            <section className="flex flex-wrap gap-6 rounded-3xl bg-white px-7 py-[22px] text-[13.5px]">
                <DatoEntrega etiqueta="Entrega para" valor={name} />
                <DatoEntrega etiqueta="WhatsApp" valor={phone} />
                <DatoEntrega etiqueta="Dirección" valor={city + ' · ' + address} />
            </section>
        </>
    )
}

function DatoEntrega({ etiqueta, valor }) {
    return (
        <div className="flex min-w-[160px] flex-1 flex-col gap-1">
            <span className="text-[10.5px] tracking-[0.16em] text-[#5a6b61] uppercase">{etiqueta}</span>
            <span className="font-medium text-forest">{valor}</span>
        </div>
    )
}

// Bloc qui presente l'entreprise : histoire, valeurs, certifications, contact
function HechoEnMalabo() {
    const mensaje = 'Hola Sandy Beauty, tengo una pregunta sobre mi pedido.'

    return (
        <section className="flex flex-col gap-[18px] rounded-[28px] bg-white p-6 sm:p-7">
            <div className="flex items-center gap-3.5">
                <img src={emblema} alt="" className="h-14 w-14 object-contain" />
                <div className="flex flex-col gap-1">
                    <span className="titulo text-xl text-forest">Hecho en Malabo</span>
                    <span className="text-xs text-[#5a6b61]">{MARCA.razonSocial}</span>
                </div>
            </div>

            <p className="text-[13.5px] leading-relaxed text-[#4d5e55]">
                Desde 2018 cultivamos moringa, cacao y coco en nuestra finca agroecológica y los
                transformamos en nuestro obrador certificado de Malabo.
            </p>

            <div className="flex flex-col gap-3">
                {VALORES.map((valor) => (
                    <div key={valor.titulo} className="flex items-start gap-3">
                        <span className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full bg-[#f7f4ee]">
                            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8a6d35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12.5l4.5 4.5L19 7.5" />
                            </svg>
                        </span>
                        <span className="text-[13px] leading-normal">
                            <b className="font-semibold text-forest">{valor.titulo}</b>
                            <br />
                            <span className="text-[#4d5e55]">{valor.texto}</span>
                        </span>
                    </div>
                ))}
            </div>

            <div className="flex flex-wrap gap-2">
                {CERTIFICACIONES.map((certificacion) => (
                    <span key={certificacion} className="rounded-full bg-[#f7f4ee] px-3 py-1.5 text-[11px] font-medium text-forest">
                        {certificacion}
                    </span>
                ))}
            </div>

            <a
                href={enlaceWhatsApp(mensaje)}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-11 items-center gap-2.5 border-t border-forest/10 pt-4 text-[13px] text-forest hover:text-forest-2"
            >
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 11.5a8 8 0 0 1-11.8 7l-4.2 1.2 1.2-4A8 8 0 1 1 20 11.5z" />
                </svg>
                ¿Dudas? Escríbenos por WhatsApp · {MARCA.telefono1}
            </a>
        </section>
    )
}

// Fleche vers la gauche des boutons "Volver"
function IconoVolver() {
    return (
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M11 6l-6 6 6 6" />
        </svg>
    )
}

function IconoCandado({ color }) {
    let trazo = 'currentColor'

    if (color) {
        trazo = color
    }

    return (
        <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={trazo} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mt-px flex-none">
            <rect x="5" y="10.5" width="14" height="10" rx="2" />
            <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
        </svg>
    )
}

// Feuille doree en filigrane, a gauche du titre (ordinateur seulement)
function HojaDecorativa() {
    return (
        <svg aria-hidden="true" width="460" height="460" viewBox="0 0 200 200" fill="none" stroke="#c9a86a" strokeWidth="0.8" className="pointer-events-none absolute top-10 -left-40 hidden opacity-30 xl:block">
            <path d="M100 190 C100 120 100 60 100 10" />
            <path d="M100 150 C70 140 45 115 40 80 C75 85 98 110 100 150" />
            <path d="M100 150 C130 140 155 115 160 80 C125 85 102 110 100 150" />
            <path d="M100 100 C78 92 62 72 60 45 C86 52 99 72 100 100" />
            <path d="M100 100 C122 92 138 72 140 45 C114 52 101 72 100 100" />
        </svg>
    )
}
