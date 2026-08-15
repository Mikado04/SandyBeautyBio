import { useEffect, useState } from 'react'
import api from '../lib/api'
import { formatPrice } from '../lib/format'

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

    // Charge les moyens de paiement actives cote serveur
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

                setError('No se pudo registrar el pedido. Inténtalo de nuevo.')
            })
    }

    // Affiche le message d'erreur renvoye par Laravel pour un champ
    function errorFor(champ) {
        if (!fieldErrors[champ]) {
            return null
        }

        return <p className="mt-1 text-xs text-red-600">{fieldErrors[champ][0]}</p>
    }

    if (cart.length === 0) {
        return (
            <div className="mx-auto max-w-2xl px-6 py-24 text-center">
                <p className="font-display text-2xl text-forest">El carrito está vacío</p>
                <button
                    onClick={onBack}
                    className="mt-6 border border-forest/20 px-6 py-3 text-[11px] tracking-[0.2em] text-forest uppercase hover:border-gold"
                >
                    Volver a la tienda
                </button>
            </div>
        )
    }

    const champ =
        'mt-1 w-full border border-forest/20 bg-white px-4 py-3 text-sm text-forest outline-none focus:border-gold'

    return (
        <div className="mx-auto max-w-2xl px-6 py-14">
            <button
                onClick={onBack}
                className="text-[11px] tracking-[0.2em] text-forest/50 uppercase hover:text-gold"
            >
                ← Volver a la tienda
            </button>

            <h1 className="font-display mt-6 text-4xl text-forest">Finalizar pedido</h1>

            <div className="mt-8 border border-forest/10 bg-white p-6">
                <p className="text-[11px] tracking-[0.25em] text-gold uppercase">Tu pedido</p>

                {cart.map((ligne) => (
                    <div key={ligne.product.id} className="mt-3 flex justify-between text-sm">
                        <span className="text-forest/70">
                            {ligne.product.name} × {ligne.quantity}
                        </span>
                        <span className="text-forest">
                            {formatPrice(ligne.product.price * ligne.quantity)}
                        </span>
                    </div>
                ))}

                <div className="mt-5 flex items-baseline justify-between border-t border-forest/10 pt-4">
                    <span className="text-[11px] tracking-[0.2em] text-forest/60 uppercase">
                        Total
                    </span>
                    <span className="font-display text-2xl text-forest">{formatPrice(total)}</span>
                </div>
            </div>

            {error && (
                <p className="mt-6 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </p>
            )}

            <form onSubmit={submit} className="mt-6 border border-forest/10 bg-white p-6">
                <p className="text-[11px] tracking-[0.25em] text-gold uppercase">Tus datos</p>

                <div className="mt-5">
                    <label className="text-[11px] tracking-widest text-forest/50 uppercase">
                        Nombre y apellidos *
                    </label>
                    <input value={name} onChange={(e) => setName(e.target.value)} className={champ} />
                    {errorFor('customer_name')}
                </div>

                <div className="mt-4">
                    <label className="text-[11px] tracking-widest text-forest/50 uppercase">
                        Teléfono WhatsApp *
                    </label>
                    <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+240 ..."
                        className={champ}
                    />
                    {errorFor('customer_phone')}
                </div>

                <div className="mt-4">
                    <label className="text-[11px] tracking-widest text-forest/50 uppercase">
                        Correo electrónico
                    </label>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} className={champ} />
                    {errorFor('customer_email')}
                </div>

                <div className="mt-4">
                    <label className="text-[11px] tracking-widest text-forest/50 uppercase">
                        Ciudad *
                    </label>
                    <input value={city} onChange={(e) => setCity(e.target.value)} className={champ} />
                    {errorFor('customer_city')}
                </div>

                <div className="mt-4">
                    <label className="text-[11px] tracking-widest text-forest/50 uppercase">
                        Dirección de entrega *
                    </label>
                    <input
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className={champ}
                    />
                    {errorFor('customer_address')}
                </div>

                <div className="mt-4">
                    <label className="text-[11px] tracking-widest text-forest/50 uppercase">
                        Notas (opcional)
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows="2"
                        placeholder="Preferencias, si es regalo..."
                        className={champ}
                    />
                </div>

                <p className="mt-8 text-[11px] tracking-[0.25em] text-gold uppercase">
                    Medio de pago
                </p>

                {methods.map((m) => (
                    <label
                        key={m.key}
                        className="mt-3 flex cursor-pointer items-center gap-3 border border-forest/20 px-4 py-3 hover:border-gold"
                    >
                        <input
                            type="radio"
                            name="payment_method"
                            value={m.key}
                            checked={method === m.key}
                            onChange={(e) => setMethod(e.target.value)}
                        />
                        <span className="text-sm text-forest">{m.label}</span>
                        <span className="ml-auto text-[11px] text-forest/40">{m.currency}</span>
                    </label>
                ))}
                {errorFor('payment_method')}

                <button
                    type="submit"
                    disabled={sending}
                    className="mt-8 w-full bg-forest py-4 text-[11px] tracking-[0.2em] text-cream uppercase transition hover:bg-gold hover:text-forest disabled:bg-forest/30"
                >
                    Confirmar pedido
                </button>
            </form>
        </div>
    )
}
