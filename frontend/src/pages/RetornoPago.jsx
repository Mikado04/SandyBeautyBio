import { useEffect, useState } from 'react'
import api from '../lib/api'
import { formatPrice } from '../lib/format'
import { MARCA, enlaceWhatsApp } from '../lib/marca'
import emblema from '../assets/emblema.png'

// Page affichee quand FedaPay renvoie le client sur le site, par exemple :
//   https://sandybeautybio.com/?pedido=SB-2026-0002&status=approved&id=524370
//
// On n'utilise QUE la reference. Le "status" de l'adresse ne prouve rien :
// n'importe qui peut le taper a la main. Le vrai statut vient de l'API,
// qui le verifie elle-meme aupres de FedaPay (OrderController::show).
//
// Design : canevas Claude Design "Sandy Beauty — Retour de paiement".
// Animations : classes CSS de index.css (sello-aparecer, trazo-check,
// entrada, deslizar-izquierda, girar-lento, elevar-boton).

// Or fonce : l'or de la marque (#c9a86a) est trop clair pour du petit texte sur fond creme
const ORO_TEXTO = 'text-[#8a6d35]'

// Retour Kkiapay : l'adresse contient en plus &transaction_id=...
// Dans ce cas, on demande au backend de CONFIRMER la transaction aupres de Kkiapay
// (POST /api/orders/{reference}/kkiapay) au lieu de simplement lire la commande.
export default function RetornoPago({ referencia, transaccionKkiapay, onBack }) {
    // La commande renvoyee par l'API : { reference, status, payment_status, total, currency }
    const [pedido, setPedido] = useState(null)
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')

    // Chaque clic sur "Comprobar de nuevo" augmente ce compteur,
    // ce qui relance l'appel a l'API dans le useEffect ci-dessous.
    const [intento, setIntento] = useState(0)

    useEffect(
        function () {
            const adresse = '/api/orders/' + encodeURIComponent(referencia)

            // FedaPay (ou simple consultation) : on lit la commande.
            // Kkiapay : on envoie le numero de transaction pour qu'il soit verifie.
            function appelerApi() {
                if (transaccionKkiapay) {
                    return api.post(adresse + '/kkiapay', { transaction_id: transaccionKkiapay })
                }

                return api.get(adresse)
            }

            appelerApi()
                .then(function (res) {
                    setPedido(res.data.data)
                })
                .catch(function (err) {
                    if (err.response && err.response.status === 404) {
                        setError('No encontramos este pedido.')
                        return
                    }

                    // 422 / 502 : le backend explique pourquoi (paiement non confirme, etc.)
                    if (err.response && err.response.data && err.response.data.message) {
                        setError(err.response.data.message)
                        return
                    }

                    setError('No se pudo comprobar el pago.')
                })
                .finally(function () {
                    setCargando(false)
                })
        },
        [referencia, transaccionKkiapay, intento]
    )

    function comprobarDeNuevo() {
        setCargando(true)
        setError('')
        setIntento(intento + 1)
    }

    // ---- 1. Verification en cours ----
    if (cargando) {
        return (
            <Marco onBack={onBack}>
                <TarjetaCentrada>
                    <SelloEspera />
                    <p className={'mt-6 text-[11px] font-semibold tracking-[0.26em] uppercase ' + ORO_TEXTO}>
                        Pedido {referencia}
                    </p>
                    <h1 className="titulo mt-4 text-4xl text-forest sm:text-5xl">
                        Comprobando <em className="text-forest-3">tu pago…</em>
                    </h1>
                </TarjetaCentrada>
            </Marco>
        )
    }

    // ---- 2. L'API n'a pas repondu, ou la reference n'existe pas ----
    if (error) {
        return (
            <Marco onBack={onBack}>
                <TarjetaCentrada>
                    <SelloEspera />
                    <p className={'mt-6 text-[11px] font-semibold tracking-[0.26em] uppercase ' + ORO_TEXTO}>
                        Pedido {referencia}
                    </p>
                    <h1 className="titulo mt-4 text-4xl text-forest sm:text-5xl">{error}</h1>
                    <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-[#4d5e55]">
                        Comprueba tu conexión e inténtalo de nuevo. Si el problema continúa,
                        escríbenos por WhatsApp con tu referencia.
                    </p>
                    <BotonPrincipal onClick={comprobarDeNuevo}>
                        <IconoRecargar />
                        Comprobar de nuevo
                    </BotonPrincipal>
                </TarjetaCentrada>
            </Marco>
        )
    }

    // ---- 3. Paiement confirme ----
    if (pedido.payment_status === 'paid') {
        return <PagoConfirmado pedido={pedido} onBack={onBack} />
    }

    // ---- 4. Paiement refuse ou annule : la commande a ete annulee ----
    if (pedido.payment_status === 'failed') {
        const mensajeAyuda =
            'Hola Sandy Beauty, mi pago del pedido ' + pedido.reference + ' no se ha completado.'

        return (
            <Marco onBack={onBack}>
                <TarjetaCentrada>
                    <div className="sello-aparecer mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#fbf1ec] shadow-[inset_0_0_0_1.5px_#b5583a]">
                        <svg aria-hidden="true" width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#9c4a30" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M7 7l10 10" />
                            <path d="M17 7L7 17" />
                        </svg>
                    </div>

                    <p className="entrada mt-6 text-[11px] font-semibold tracking-[0.26em] text-[#9c4a30] uppercase">
                        Pago no completado
                    </p>
                    <h1 className="entrada titulo mt-4 text-4xl text-forest sm:text-5xl" style={{ animationDelay: '0.1s' }}>
                        Tu pago <em className="text-forest-3">no se ha realizado</em>
                    </h1>
                    <p className="entrada mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-[#4d5e55]" style={{ animationDelay: '0.2s' }}>
                        El pago fue rechazado o cancelado, así que hemos anulado el pedido. No te
                        preocupes: no se ha realizado ningún cargo.
                    </p>

                    <div className="entrada mt-6 inline-flex items-center gap-3 rounded-full bg-[#f7f4ee] px-5 py-2.5" style={{ animationDelay: '0.3s' }}>
                        <span className="text-[10px] tracking-[0.14em] text-[#5a6b61] uppercase">Pedido anulado</span>
                        <span className="titulo text-lg text-forest line-through decoration-forest/35">
                            {pedido.reference}
                        </span>
                    </div>

                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <BotonPrincipal onClick={onBack}>Volver a la tienda</BotonPrincipal>
                        <EnlaceSecundario href={enlaceWhatsApp(mensajeAyuda)}>
                            <IconoWhatsApp />
                            Pedir ayuda
                        </EnlaceSecundario>
                    </div>

                    <p className="mt-6 text-[13px] leading-relaxed text-[#5a6b61]">
                        También puedes pagar por{' '}
                        <b className="font-semibold text-forest">transferencia bancaria</b> al hacer un
                        nuevo pedido.
                    </p>
                </TarjetaCentrada>
            </Marco>
        )
    }

    // ---- 5. Toujours en attente : FedaPay n'a pas encore confirme ----
    const mensajePendiente =
        'Hola Sandy Beauty, pagué el pedido ' + pedido.reference + ' pero sigue pendiente.'

    return (
        <Marco onBack={onBack}>
            <TarjetaCentrada>
                <SelloEspera />

                <p className={'entrada mt-6 text-[11px] font-semibold tracking-[0.26em] uppercase ' + ORO_TEXTO}>
                    Pago pendiente
                </p>
                <h1 className="entrada titulo mt-4 text-4xl text-forest sm:text-5xl" style={{ animationDelay: '0.1s' }}>
                    Esperamos la <em className="text-forest-3">confirmación</em> de tu pago
                </h1>
                <p className="entrada mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-[#4d5e55]" style={{ animationDelay: '0.2s' }}>
                    FedaPay todavía no nos ha confirmado el pago. Si acabas de pagar, espera unos
                    segundos y vuelve a comprobarlo.
                </p>

                <div className="entrada mt-6 inline-flex flex-wrap items-center justify-center gap-3 rounded-full bg-[#f7f4ee] px-5 py-2.5 text-[13px]" style={{ animationDelay: '0.3s' }}>
                    <span className="text-[10px] tracking-[0.14em] text-[#5a6b61] uppercase">Pedido</span>
                    <span className="titulo text-lg text-forest">{pedido.reference}</span>
                    <span className="text-forest/25">|</span>
                    <span className="font-medium text-forest">{formatPrice(pedido.total, pedido.currency)}</span>
                </div>

                <div className="mt-8 flex justify-center">
                    <BotonPrincipal onClick={comprobarDeNuevo}>
                        <IconoRecargar />
                        Comprobar de nuevo
                    </BotonPrincipal>
                </div>

                <p className="mt-6 text-[13px] leading-relaxed text-[#5a6b61]">
                    ¿Ya pagaste y sigue pendiente?{' '}
                    <a href={enlaceWhatsApp(mensajePendiente)} target="_blank" rel="noreferrer" className="font-medium text-forest underline underline-offset-2">
                        Escríbenos por WhatsApp
                    </a>{' '}
                    con tu referencia.
                </p>
            </TarjetaCentrada>
        </Marco>
    )
}

// ------------------------------------------------------------------
// Paiement confirme : la page la plus riche (sceau, ticket, 3 etapes)
// ------------------------------------------------------------------
function PagoConfirmado({ pedido, onBack }) {
    const mensaje =
        'Hola Sandy Beauty, acabo de pagar el pedido ' +
        pedido.reference +
        ' por ' +
        formatPrice(pedido.total, pedido.currency) +
        '.'

    // L'API renvoie "fedapay" ou "bank_transfer" : on affiche un nom lisible
    let medioDePago = 'Transferencia bancaria'

    if (pedido.payment_method === 'fedapay') {
        medioDePago = 'FedaPay'
    }

    // Le montant sans la devise, pour l'afficher en grand a part : "7 500"
    const importe = new Intl.NumberFormat('fr-FR').format(pedido.total)

    return (
        <Marco onBack={onBack} conHoja>
            <div className="relative mx-auto flex max-w-[1120px] flex-wrap items-start gap-14 px-6 pt-14 pb-12 sm:pt-[72px]">
                {/* Colonne gauche : sceau, titre, boutons */}
                <section className="flex min-w-0 flex-[999_1_480px] flex-col gap-7">
                    <div className="sello-aparecer flex h-24 w-24 items-center justify-center rounded-full bg-forest shadow-[0_0_0_8px_#f7f4ee,0_0_0_9px_#c9a86a] sm:h-28 sm:w-28">
                        <svg aria-hidden="true" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#c9a86a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <path className="trazo-check" pathLength="1" d="M5 12.5l4.5 4.5L19 7.5" />
                        </svg>
                    </div>

                    <div className="flex flex-col gap-4">
                        <p className={'entrada text-[11px] font-semibold tracking-[0.26em] uppercase ' + ORO_TEXTO}>
                            Pago confirmado
                        </p>
                        <h1 className="entrada titulo text-[40px] leading-[1.05] text-forest sm:text-[60px]" style={{ animationDelay: '0.1s' }}>
                            Gracias, tu pedido
                            <br />
                            <em className="text-forest-3">ya está en marcha</em>
                        </h1>
                        <p className="entrada max-w-[480px] text-base leading-relaxed text-[#4d5e55]" style={{ animationDelay: '0.2s' }}>
                            Hemos recibido tu pago. Preparamos tus productos a mano en nuestro taller
                            de Malabo y te escribiremos por WhatsApp para coordinar la entrega.
                        </p>
                    </div>

                    <div className="entrada flex flex-wrap gap-3" style={{ animationDelay: '0.3s' }}>
                        <EnlacePrincipal href={enlaceWhatsApp(mensaje)}>
                            <IconoWhatsApp />
                            Escribirnos por WhatsApp
                        </EnlacePrincipal>
                        <BotonSecundario onClick={onBack}>Seguir comprando</BotonSecundario>
                    </div>
                </section>

                {/* Colonne droite : le ticket */}
                <aside className="deslizar-izquierda w-full max-w-[460px] min-w-0 flex-[1_1_380px] overflow-hidden rounded-[28px] bg-white shadow-[0_30px_60px_-30px_rgba(27,67,50,0.35)]">
                    <div className="flex items-center justify-between gap-4 bg-forest px-7 py-6 text-white">
                        <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] tracking-[0.24em] text-gold uppercase">Resumen del pedido</span>
                            <span className="titulo text-[28px] leading-none">{pedido.reference}</span>
                        </div>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-3.5 py-1.5 text-[11px] font-medium text-[#f1dfb8]">
                            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12.5l4.5 4.5L19 7.5" />
                            </svg>
                            Pagado
                        </span>
                    </div>

                    <div className="px-7 pt-2.5">
                        <LineaTicket etiqueta="Medio de pago" valor={medioDePago} conBorde />
                        <LineaTicket etiqueta="Moneda" valor={nombreDivisa(pedido.currency)} />
                    </div>

                    {/* Perforation du ticket : deux demi-cercles et un pointille */}
                    <div aria-hidden="true" className="relative flex h-7 items-center">
                        <div className="absolute -left-3.5 h-7 w-7 rounded-full bg-[#f7f4ee]" />
                        <div className="mx-6 flex-1 border-t-2 border-dashed border-forest/15" />
                        <div className="absolute -right-3.5 h-7 w-7 rounded-full bg-[#f7f4ee]" />
                    </div>

                    <div className="flex flex-col gap-4 px-7 pt-2 pb-7">
                        <div className="flex items-baseline justify-between gap-4">
                            <span className="text-[11px] tracking-[0.22em] text-[#5a6b61] uppercase">Total pagado</span>
                            <span className="titulo text-[40px] leading-none text-forest">
                                {importe}{' '}
                                <span className="font-sans text-lg font-medium text-[#5a6b61]">{pedido.currency}</span>
                            </span>
                        </div>
                        <NotaDivisa currency={pedido.currency} />
                    </div>
                </aside>
            </div>

            {/* Les trois etapes */}
            <div className="relative mx-auto max-w-[1120px] px-6 pb-20">
                <p className={'mb-5 text-[11px] font-semibold tracking-[0.26em] uppercase ' + ORO_TEXTO}>
                    Lo que pasa ahora
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="entrada flex flex-col gap-3.5 rounded-[22px] bg-forest p-6 text-white" style={{ animationDelay: '0.5s' }}>
                        <div className="flex items-center justify-between">
                            <span className="titulo text-[28px] text-gold">01</span>
                            <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-gold">
                                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1b4332" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                                </svg>
                            </span>
                        </div>
                        <span className="text-[17px] font-medium">Pago recibido</span>
                        <span className="text-[13.5px] leading-relaxed text-white/80">
                            Hemos confirmado tu pago. Tu pedido queda reservado.
                        </span>
                    </div>

                    <div className="entrada flex flex-col gap-3.5 rounded-[22px] bg-white p-6 shadow-[inset_0_0_0_1.5px_#c9a86a]" style={{ animationDelay: '0.6s' }}>
                        <div className="flex items-center justify-between">
                            <span className={'titulo text-[28px] ' + ORO_TEXTO}>02</span>
                            <span className={'rounded-full bg-[#f7f4ee] px-3 py-1.5 text-[10px] font-semibold tracking-[0.14em] uppercase ' + ORO_TEXTO}>
                                En curso
                            </span>
                        </div>
                        <span className="text-[17px] font-medium text-forest">Preparación en Malabo</span>
                        <span className="text-[13.5px] leading-relaxed text-[#4d5e55]">
                            Elaboramos y empaquetamos tus productos a mano en nuestro taller.
                        </span>
                    </div>

                    <div className="entrada flex flex-col gap-3.5 rounded-[22px] bg-white p-6 shadow-[inset_0_0_0_1px_rgba(27,67,50,0.10)]" style={{ animationDelay: '0.7s' }}>
                        <span className="titulo text-[28px] text-[#9aa59f]">03</span>
                        <span className="text-[17px] font-medium text-forest">Entrega</span>
                        <span className="text-[13.5px] leading-relaxed text-[#4d5e55]">
                            Te escribimos por WhatsApp para acordar el día y el lugar de entrega.
                        </span>
                    </div>
                </div>
            </div>
        </Marco>
    )
}

// ------------------------------------------------------------------
// Petits morceaux reutilises dans les differents etats
// ------------------------------------------------------------------

// En-tete, fond creme et pied de page communs a tous les etats.
// conHoja = afficher la feuille doree en filigrane (page "paye" seulement).
function Marco({ children, onBack, conHoja }) {
    return (
        <div className="flex min-h-screen flex-col bg-[#f7f4ee] text-forest">
            <header className="border-b border-forest/10 bg-[#fdfbf7]">
                <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-4 px-6 py-4">
                    <div className="flex items-center gap-3.5">
                        <img src={emblema} alt="Sandy Beauty" className="h-12 w-12 object-contain" />
                        <div className="flex flex-col gap-0.5">
                            <span className="titulo text-[22px] leading-none">{MARCA.nombre}</span>
                            <span className="text-[10px] tracking-[0.22em] text-[#5a6b61] uppercase">
                                Biocosmética · Malabo
                            </span>
                        </div>
                    </div>
                    <button onClick={onBack} className="boton-contorno">
                        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5" />
                            <path d="M11 6l-6 6 6 6" />
                        </svg>
                        Volver a la tienda
                    </button>
                </div>
            </header>

            <main className="relative flex-1 overflow-hidden">
                {conHoja && <HojaDecorativa />}
                {children}
            </main>

            <footer className="bg-forest text-white/75">
                <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-3 px-6 py-6 text-xs">
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

// Carte blanche centree : attente, erreur et echec
function TarjetaCentrada({ children }) {
    return (
        <div className="flex justify-center px-6 py-14 sm:py-[72px]">
            <div className="w-full max-w-[620px] rounded-[32px] bg-white px-6 pt-14 pb-11 text-center shadow-[0_30px_60px_-32px_rgba(27,67,50,0.35)] sm:px-12">
                {children}
            </div>
        </div>
    )
}

// Sceau creme avec un sablier qui se retourne lentement
function SelloEspera() {
    return (
        <div className="sello-aparecer mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#f7f4ee] shadow-[inset_0_0_0_1.5px_#c9a86a]">
            <svg className="girar-lento" aria-hidden="true" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8a6d35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 3h10" />
                <path d="M7 21h10" />
                <path d="M8 3c0 4 8 5 8 9s-8 5-8 9" />
                <path d="M16 3c0 4-8 5-8 9s8 5 8 9" />
            </svg>
        </div>
    )
}

// Une ligne "libelle ... valeur" du ticket
function LineaTicket({ etiqueta, valor, conBorde }) {
    let clases = 'flex justify-between gap-4 py-4 text-sm'

    if (conBorde) {
        clases = clases + ' border-b border-forest/10'
    }

    return (
        <div className={clases}>
            <span className="text-[#5a6b61]">{etiqueta}</span>
            <span className="font-medium text-forest">{valor}</span>
        </div>
    )
}

function nombreDivisa(currency) {
    if (currency === 'XOF') {
        return 'Franco CFA (XOF)'
    }

    if (currency === 'XAF') {
        return 'Franco CFA (XAF)'
    }

    return currency
}

// Version condensee possible de nombreDivisa :
// const NOMBRES = { XOF: 'Franco CFA (XOF)', XAF: 'Franco CFA (XAF)' }
// return NOMBRES[currency] ?? currency
// Plus courte : on ajoute une devise en ajoutant une ligne au tableau, sans nouveau if.

// FedaPay encaisse en XOF alors que la boutique affiche des XAF :
// meme valeur, mais le client doit savoir pourquoi son releve indique XOF.
function NotaDivisa({ currency }) {
    if (currency !== 'XOF') {
        return null
    }

    return (
        <div className="flex items-start gap-3 rounded-2xl bg-[#f7f4ee] px-4 py-3.5 text-[12.5px] leading-relaxed text-[#4d5e55]">
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8a6d35" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="mt-px flex-none">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5" />
                <path d="M12 7.5v.01" />
            </svg>
            <span>
                El XOF (franco CFA de África Occidental) tiene exactamente el mismo valor que el XAF.
                Por eso tu justificante indica XOF.
            </span>
        </div>
    )
}

// Feuille doree en filigrane, en haut a droite de la page "paye"
function HojaDecorativa() {
    return (
        <svg aria-hidden="true" width="520" height="520" viewBox="0 0 200 200" fill="none" stroke="#c9a86a" strokeWidth="0.8" className="pointer-events-none absolute -top-16 -right-32 hidden opacity-35 sm:block">
            <path d="M100 190 C100 120 100 60 100 10" />
            <path d="M100 150 C70 140 45 115 40 80 C75 85 98 110 100 150" />
            <path d="M100 150 C130 140 155 115 160 80 C125 85 102 110 100 150" />
            <path d="M100 100 C78 92 62 72 60 45 C86 52 99 72 100 100" />
            <path d="M100 100 C122 92 138 72 140 45 C114 52 101 72 100 100" />
            <path d="M100 55 C90 48 84 36 85 22 C97 28 101 40 100 55" />
            <path d="M100 55 C110 48 116 36 115 22 C103 28 99 40 100 55" />
        </svg>
    )
}

// Les boutons et liens : vert plein (principal) ou contour (secondaire)
const CLASES_PRINCIPAL =
    'elevar-boton inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-full bg-forest px-7 text-xs font-medium tracking-[0.14em] text-white uppercase hover:bg-forest-2'

const CLASES_SECUNDARIO =
    'elevar-boton inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-full border border-forest/35 px-7 text-xs font-medium tracking-[0.14em] text-forest uppercase hover:border-forest'

function BotonPrincipal({ onClick, children }) {
    return (
        <button onClick={onClick} className={CLASES_PRINCIPAL}>
            {children}
        </button>
    )
}

function BotonSecundario({ onClick, children }) {
    return (
        <button onClick={onClick} className={CLASES_SECUNDARIO}>
            {children}
        </button>
    )
}

function EnlacePrincipal({ href, children }) {
    return (
        <a href={href} target="_blank" rel="noreferrer" className={CLASES_PRINCIPAL}>
            {children}
        </a>
    )
}

function EnlaceSecundario({ href, children }) {
    return (
        <a href={href} target="_blank" rel="noreferrer" className={CLASES_SECUNDARIO}>
            {children}
        </a>
    )
}

function IconoWhatsApp() {
    return (
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 11.5a8 8 0 0 1-11.8 7l-4.2 1.2 1.2-4A8 8 0 1 1 20 11.5z" />
        </svg>
    )
}

function IconoRecargar() {
    return (
        <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 12a8 8 0 1 1-2.3-5.6" />
            <path d="M20 4v5h-5" />
        </svg>
    )
}
