import { formatPrice } from '../lib/format'
import { MARCA, enlaceWhatsApp } from '../lib/marca'

export default function Confirmation({ pedido, onBack }) {
    if (!pedido) {
        return null
    }

    const mensaje =
        'Hola Sandy Beauty, acabo de hacer el pedido ' +
        pedido.reference +
        ' por ' +
        formatPrice(pedido.total, pedido.currency) +
        '. Adjunto el justificante de la transferencia.'

    return (
        <div className="min-h-screen bg-[#fdfbf7]">
            <div className="mx-auto max-w-2xl px-6 py-14">
                <div className="rounded-3xl bg-forest p-10 text-center text-white">
                    <p className="text-[10px] tracking-[0.25em] text-gold uppercase">
                        Pedido registrado
                    </p>

                    <p className="titulo mt-5 text-4xl">{pedido.reference}</p>

                    <p className="mt-3 text-lg text-white/70">
                        {formatPrice(pedido.total, pedido.currency)}
                    </p>
                </div>

                <div className="mt-8 rounded-3xl bg-white p-7">
                    <p className="text-[10px] tracking-[0.2em] text-muted uppercase">
                        Instrucciones de pago
                    </p>

                    <p className="mt-4 text-sm leading-relaxed text-muted">
                        Realiza una transferencia por el importe indicado y escribe la referencia{' '}
                        <b className="text-forest">{pedido.reference}</b> en el concepto. Preparamos
                        tu pedido en cuanto confirmemos la recepción.
                    </p>

                    <table className="mt-7 w-full text-sm">
                        <tbody>
                            <Ligne label="Banco" valeur={pedido.payment.bank} />
                            <Ligne label="Titular" valeur={pedido.payment.account_name} />
                            <Ligne label="Número de cuenta" valeur={pedido.payment.account} />
                            <Ligne label="SWIFT" valeur={pedido.payment.swift} />
                            <Ligne
                                label="Importe"
                                valeur={formatPrice(pedido.total, pedido.currency)}
                            />
                            <Ligne label="Concepto" valeur={pedido.reference} />
                        </tbody>
                    </table>

                    <a
                        href={enlaceWhatsApp(mensaje)}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-8 block w-full rounded-full bg-forest py-4 text-center text-[11px] font-medium tracking-[0.15em] text-white uppercase transition hover:bg-forest-2"
                    >
                        Enviar justificante por WhatsApp
                    </a>

                    <p className="mt-4 text-center text-[11px] text-muted">
                        {MARCA.razonSocial} · {MARCA.direccion}
                    </p>
                </div>

                <button
                    onClick={onBack}
                    className="boton-contorno mt-8"
                >
                    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5" />
                        <path d="M11 6l-6 6 6 6" />
                    </svg>
                    Volver a la tienda
                </button>
            </div>
        </div>
    )
}

function Ligne({ label, valeur }) {
    let contenu = valeur

    if (!valeur) {
        contenu = '—'
    }

    return (
        <tr className="border-b border-forest/10">
            <td className="py-3 text-[11px] tracking-[0.12em] text-muted uppercase">{label}</td>
            <td className="py-3 text-right text-forest">{contenu}</td>
        </tr>
    )
}
