import { useState } from 'react'
import api from '../lib/api'
import { MARCA } from '../lib/marca'

export default function AdminLogin({ onLogin, onBack }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [sending, setSending] = useState(false)
    const [error, setError] = useState(null)

    function submit(event) {
        event.preventDefault()

        setSending(true)
        setError(null)

        api.post('/api/login', { email: email, password: password })
            .then((res) => {
                onLogin(res.data.token)
            })
            .catch((err) => {
                setSending(false)

                if (err.response && err.response.status === 422) {
                    setError(err.response.data.message)
                    return
                }

                setError('No se pudo conectar con el servidor.')
            })
    }

    const champ =
        'mt-1 w-full border border-cream/25 bg-transparent px-4 py-3 text-sm text-cream outline-none focus:border-gold'

    return (
        <div className="flex min-h-screen items-center justify-center bg-forest px-6">
            <form onSubmit={submit} className="w-full max-w-sm">
                <p className="font-display text-center text-2xl text-cream">{MARCA.nombre}</p>
                <p className="mt-1 text-center text-[10px] tracking-[0.3em] text-gold uppercase">
                    Administración
                </p>

                {error && (
                    <p className="mt-8 border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {error}
                    </p>
                )}

                <div className="mt-8">
                    <label className="text-[11px] tracking-widest text-cream/50 uppercase">
                        Correo electrónico
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={champ}
                    />
                </div>

                <div className="mt-4">
                    <label className="text-[11px] tracking-widest text-cream/50 uppercase">
                        Contraseña
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={champ}
                    />
                </div>

                <button
                    type="submit"
                    disabled={sending}
                    className="mt-8 w-full bg-gold py-4 text-[11px] tracking-[0.2em] text-forest uppercase transition hover:bg-gold-light disabled:opacity-50"
                >
                    Entrar
                </button>

                <button
                    type="button"
                    onClick={onBack}
                    className="mt-5 w-full text-[11px] tracking-[0.2em] text-cream/50 uppercase hover:text-gold"
                >
                    Volver a la tienda
                </button>
            </form>
        </div>
    )
}
