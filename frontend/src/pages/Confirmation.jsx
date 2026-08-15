import { formatPrice } from '../lib/format'
import { MARCA, enlaceWhatsApp } from '../lib/marca'

export default function Confirmation({ pedido, onBack }) {
    if (!pedido) {
        return null
    }

    const mensaje =
        'Hola, acabo de hacer el pedido ' +
        pedido.reference +
        ' por ' +
        pedido.total +
        ' ' +
        pedido.currency +
        '. Adjunto el justificante de la transferencia.'

    return (
        <div className="mx-auto max-w-2xl px-6 py-14">
            <div className="border border-gold bg-white p-10 text-center">
                <p className="text-[11px] tracking-[0.3em] text-gold uppercase">
                    Pedido registrado
                </p>

                <p className="font-display mt-5 text-4xl text-forest">{pedido.reference}</p>

                <p className="mt-3 text-lg text-forest/70">
                    {formatPrice(pedido.total, pedido.currency)}
                </p>
            </div>

            <div className="mt-8 border border-forest/10 bg-white p-6">
                <p className="text-[11px] tracking-[0.25em] text-gold uppercase">
                    Instrucciones de pago
                </p>

                <p className="mt-4 text-sm leading-relaxed text-forest/70">
                    Realiza una transferencia por el importe indicado y escribe la referencia{' '}
                    <b className="text-forest">{pedido.reference}</b> en el concepto. Preparamos tu
                    pedido en cuanto confirmemos la recepción.
                </p>

                <table className="mt-6 w-full text-sm">
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
                    className="mt-8 block w-full bg-forest py-4 text-center text-[11px] tracking-[0.2em] text-cream uppercase transition hover:bg-gold hover:text-forest"
                >
                    Enviar justificante por WhatsApp
                </a>

                <p className="mt-4 text-center text-[11px] text-forest/40">
                    {MARCA.razonSocial} · {MARCA.direccion}
                </p>
            </div>

            <button
                onClick={onBack}
                className="mt-8 text-[11px] tracking-[0.2em] text-forest/50 uppercase hover:text-gold"
            >
                ← Volver a la tienda
            </button>
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
            <td className="py-3 text-[11px] tracking-widest text-forest/50 uppercase">{label}</td>
            <td className="py-3 text-right text-forest">{contenu}</td>
        </tr>
    )
}
