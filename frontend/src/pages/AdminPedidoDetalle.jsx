import { useEffect, useState } from 'react'
import api, { authHeader } from '../lib/api'
import { formatPrice, formatFecha } from '../lib/format'
import { etiquetaEstado, claseEstado, etiquetaPago, enlaceWhatsAppCliente, dondeReembolsar } from '../lib/pedidos'
import AdminBarra from '../components/AdminBarra'
import VentanaConfirmar, { Punto } from '../components/VentanaConfirmar'
import emblema from '../assets/emblema.png'

// Fiche d'une commande : suivi, articles, cliente, paiement, actions.
// API : GET /api/admin/orders/{reference} et POST /api/admin/orders/{reference}/status

export default function AdminPedidoDetalle({ referencia, onVolver, onSeccion, onBack, onLogout }) {
    const [pedido, setPedido] = useState(null)
    const [cargando, setCargando] = useState(true)
    const [enviando, setEnviando] = useState(false)
    const [error, setError] = useState(null)

    useEffect(
        function () {
            api.get('/api/admin/orders/' + encodeURIComponent(referencia), { headers: authHeader() })
                .then(function (res) {
                    setPedido(res.data.data)
                })
                .catch(function (err) {
                    if (err.response && err.response.status === 401) {
                        onLogout()
                        return
                    }

                    setError('No se pudo cargar el pedido.')
                })
                .finally(function () {
                    setCargando(false)
                })
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [referencia]
    )

    // La fenetre de confirmation d'annulation est-elle ouverte ?
    const [confirmarAnulacion, setConfirmarAnulacion] = useState(false)

    // Les boutons de la fiche passent par ici. L'annulation ouvre d'abord la
    // fenetre de confirmation : rien n'est envoye tant qu'on n'a pas confirme.
    function pedirCambio(nuevo) {
        if (nuevo === 'cancelled') {
            setConfirmarAnulacion(true)
            return
        }

        cambiarEstado(nuevo)
    }

    // Envoyee, livree ou annulee. Le backend verifie que le passage est permis.
    function cambiarEstado(nuevo) {
        setConfirmarAnulacion(false)
        setEnviando(true)
        setError(null)

        api.post('/api/admin/orders/' + encodeURIComponent(pedido.reference) + '/status', { status: nuevo }, { headers: authHeader() })
            .then(function (res) {
                setPedido(res.data.data)
            })
            .catch(function (err) {
                if (err.response && err.response.status === 401) {
                    onLogout()
                    return
                }

                let message = 'No se pudo actualizar el pedido.'

                if (err.response && err.response.data && err.response.data.message) {
                    message = err.response.data.message
                }

                setError(message)
            })
            .finally(function () {
                setEnviando(false)
            })
    }

    return (
        <div className="min-h-screen bg-cream text-forest">
            <AdminBarra seccion="pedidos" onSeccion={onSeccion} onBack={onBack} onLogout={onLogout} />

            <main className="mx-auto flex max-w-[1320px] flex-col gap-5 px-4 py-7 sm:px-8">
                <button onClick={onVolver} className="boton-contorno self-start">
                    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5" />
                        <path d="M11 6l-6 6 6 6" />
                    </svg>
                    Volver a pedidos
                </button>

                {error && (
                    <p className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</p>
                )}

                {cargando && (
                    <p className="py-20 text-center text-[11px] tracking-[0.2em] text-muted uppercase">Cargando</p>
                )}

                {pedido && <Ficha pedido={pedido} enviando={enviando} onCambiar={pedirCambio} />}
            </main>

            {pedido && confirmarAnulacion && (
                <VentanaAnular
                    pedido={pedido}
                    onConfirmar={() => cambiarEstado('cancelled')}
                    onCerrar={() => setConfirmarAnulacion(false)}
                />
            )}
        </div>
    )
}

function Ficha({ pedido, enviando, onCambiar }) {
    const paiement = pedido.payments.length > 0 ? pedido.payments[0] : null
    const mensaje = 'Hola ' + pedido.customer_name + ', le escribimos de Sandy Beauty sobre su pedido ' + pedido.reference + '.'

    // Commande annulee alors qu'elle etait payee : l'argent est a rendre a la main
    const reembolsoPendiente = pedido.status === 'cancelled' && pedido.payment_status === 'paid'

    return (
        <>
            {/* Reference, statut et actions principales */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3.5">
                    <h1 className="titulo text-[34px] leading-none sm:text-[42px]">{pedido.reference}</h1>
                    <span className={claseEstado(pedido.status)}>{etiquetaEstado(pedido.status)}</span>
                </div>

                <div className="flex flex-wrap gap-2.5">
                    {pedido.status === 'paid' && (
                        <BotonPrincipal disabled={enviando} onClick={() => onCambiar('shipped')}>
                            Marcar como enviado
                        </BotonPrincipal>
                    )}
                    {pedido.status === 'shipped' && (
                        <BotonPrincipal disabled={enviando} onClick={() => onCambiar('delivered')}>
                            Marcar como entregado
                        </BotonPrincipal>
                    )}
                    <a href={enlaceWhatsAppCliente(pedido.customer_phone, mensaje)} target="_blank" rel="noreferrer" className="boton-contorno min-h-12">
                        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 11.5a8 8 0 0 1-11.8 7l-4.2 1.2 1.2-4A8 8 0 1 1 20 11.5z" />
                        </svg>
                        WhatsApp a la clienta
                    </a>
                </div>
            </div>

            {reembolsoPendiente && (
                <p className="rounded-2xl border border-[#d99a4e] bg-[#fff8e8] px-5 py-4 text-sm text-[#7a4a12]">
                    <b className="font-semibold">Reembolso pendiente.</b> Este pedido se pagó y luego se anuló:
                    devuelve {formatPrice(pedido.total, pedido.currency)} a la clienta{' '}
                    {dondeReembolsar(pedido.payment_method)}.
                </p>
            )}

            <Seguimiento pedido={pedido} />

            <div className="flex flex-wrap items-start gap-4">
                {/* Articles */}
                <section className="min-w-0 flex-[999_1_520px] rounded-[22px] bg-white p-5 sm:p-6">
                    <h2 className="mb-2 text-base font-medium">Artículos</h2>

                    {pedido.items.map((ligne) => (
                        <div key={ligne.id} className="flex items-center gap-3.5 border-b border-forest/10 py-3.5">
                            <span className="flex h-[52px] w-[52px] flex-none items-center justify-center rounded-[14px] bg-cream">
                                <img src={emblema} alt="" className="h-9 w-9 object-contain" />
                            </span>
                            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                                <span className="text-[14.5px] font-medium">{ligne.name}</span>
                                <span className="text-xs text-[#6f7c75]">
                                    {ligne.size ? ligne.size + ' · ' : ''}
                                    {formatPrice(ligne.unit_price)} la unidad
                                </span>
                            </span>
                            <span className="text-[13.5px] text-[#4d5e55]">× {ligne.quantity}</span>
                            <span className="w-[110px] text-right font-medium">{formatPrice(ligne.subtotal)}</span>
                        </div>
                    ))}

                    <div className="mt-4 flex items-baseline justify-between border-t border-dashed border-gold/60 pt-3">
                        <span className="text-[11px] tracking-[0.18em] text-[#5a6b61] uppercase">Total</span>
                        <span className="titulo text-[32px] leading-none">
                            {new Intl.NumberFormat('fr-FR').format(pedido.total)}{' '}
                            <span className="font-sans text-[13px] text-[#5a6b61]">{pedido.currency}</span>
                        </span>
                    </div>

                    {pedido.notes && (
                        <div className="mt-4 rounded-2xl bg-cream px-4 py-3.5 text-[13px] leading-relaxed">
                            <span className="block text-[10.5px] tracking-[0.16em] text-[#5a6b61] uppercase">Nota de la clienta</span>
                            {pedido.notes}
                        </div>
                    )}
                </section>

                {/* Cliente, paiement, annulation */}
                <aside className="flex min-w-0 max-w-[460px] flex-[1_1_340px] flex-col gap-4">
                    <section className="flex flex-col gap-3.5 rounded-[22px] bg-white p-5 sm:p-6">
                        <h2 className="text-base font-medium">Clienta</h2>
                        <div className="flex flex-col gap-1">
                            <span className="text-[15px] font-medium">{pedido.customer_name}</span>
                            <span className="text-[13px] text-[#4d5e55]">
                                {pedido.customer_phone}
                                {pedido.customer_email ? ' · ' + pedido.customer_email : ''}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10.5px] tracking-[0.16em] text-[#5a6b61] uppercase">Entrega</span>
                            <span className="text-[13.5px] leading-relaxed">
                                {pedido.customer_city} · {pedido.customer_address}
                            </span>
                        </div>
                    </section>

                    <section className="flex flex-col gap-3 rounded-[22px] bg-white p-5 text-[13.5px] sm:p-6">
                        <h2 className="text-base font-medium">Pago</h2>
                        <Linea etiqueta="Medio" valor={etiquetaPago(pedido.payment_method)} />
                        <Linea etiqueta="Estado del pago" valor={textoPago(pedido.payment_status)} />
                        {paiement && paiement.external_reference && (
                            <Linea etiqueta="Transacción" valor={paiement.external_reference} mono />
                        )}
                        <Linea etiqueta="Confirmado" valor={formatFecha(pedido.paid_at)} />
                        <Linea etiqueta="Moneda" valor={pedido.currency === 'XOF' ? 'XOF (= XAF)' : pedido.currency} />
                    </section>

                    {(pedido.status === 'pending' || pedido.status === 'paid') && (
                        <button onClick={() => onCambiar('cancelled')} disabled={enviando} className="boton-peligro self-start disabled:opacity-40">
                            Anular pedido
                        </button>
                    )}
                </aside>
            </div>
        </>
    )
}

// La frise : creee, payee, envoyee, livree (ou annulee)
function Seguimiento({ pedido }) {
    const etapas = [
        { texto: 'Pedido creado', fecha: pedido.created_at },
        { texto: 'Pagado', fecha: pedido.paid_at },
        { texto: 'Enviado', fecha: pedido.shipped_at },
        { texto: 'Entregado', fecha: pedido.delivered_at },
    ]

    if (pedido.status === 'cancelled') {
        etapas.push({ texto: 'Anulado', fecha: pedido.cancelled_at })
    }

    return (
        <ol aria-label="Seguimiento del pedido" className="grid grid-cols-2 gap-3 rounded-[22px] bg-white p-5 sm:grid-cols-4 sm:px-6">
            {etapas.map((etapa) => (
                <li key={etapa.texto} className="flex flex-col gap-2">
                    <span className={etapa.fecha ? 'h-1 rounded-full bg-forest' : 'h-1 rounded-full bg-[#e7e2d8]'} />
                    <span className={etapa.fecha ? 'text-[13px] font-medium' : 'text-[13px] text-[#6f7c75]'}>{etapa.texto}</span>
                    <span className="text-xs text-[#6f7c75]">{formatFecha(etapa.fecha)}</span>
                </li>
            ))}
        </ol>
    )
}

function textoPago(paymentStatus) {
    if (paymentStatus === 'paid') {
        return 'Pagado'
    }

    if (paymentStatus === 'failed') {
        return 'Fallido'
    }

    return 'Pendiente'
}

function Linea({ etiqueta, valor, mono }) {
    return (
        <div className="flex justify-between gap-3">
            <span className="text-[#5a6b61]">{etiqueta}</span>
            <span className={mono ? 'font-mono text-[12.5px]' : ''}>{valor}</span>
        </div>
    )
}

function BotonPrincipal({ onClick, disabled, children }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-forest px-6 text-xs font-medium tracking-[0.14em] text-white uppercase hover:bg-forest-2 disabled:opacity-40"
        >
            {children}
        </button>
    )
}

// Fenetre de confirmation avant d'annuler une commande (voir components/VentanaConfirmar.jsx)
function VentanaAnular({ pedido, onConfirmar, onCerrar }) {
    const yaPagado = pedido.payment_status === 'paid'

    return (
        <VentanaConfirmar
            titulo="¿Anular el pedido?"
            subtitulo={pedido.reference + ' · ' + pedido.customer_name}
            textoConfirmar="Sí, anular pedido"
            onConfirmar={onConfirmar}
            onCerrar={onCerrar}
        >
            <ul className="flex flex-col gap-2.5 text-[14px] leading-relaxed text-[#4d5e55]">
                <Punto>Los artículos vuelven al stock y el pedido pasa a «Anulado».</Punto>
                <Punto>Esta acción no se puede deshacer.</Punto>
            </ul>

            {yaPagado && (
                <div className="rounded-2xl border border-[#d99a4e] bg-[#fff8e8] px-4 py-3.5 text-[13.5px] leading-relaxed text-[#7a4a12]">
                    <b className="font-semibold">Este pedido ya está pagado.</b> Después de anularlo,
                    devuelve {formatPrice(pedido.total, pedido.currency)} a la clienta{' '}
                    {dondeReembolsar(pedido.payment_method)}: la web no reembolsa automáticamente.
                </div>
            )}
        </VentanaConfirmar>
    )
}
