import { useEffect, useState } from 'react'
import api, { authHeader } from '../lib/api'
import { formatPrice } from '../lib/format'

export default function AdminProducts({ onLogout, onBack, onNew, onEdit }) {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        load()
    }, [])

    function load() {
        setLoading(true)
        setError(null)

        api.get('/api/admin/products', { headers: authHeader() })
            .then((res) => {
                setProducts(res.data.data)
                setLoading(false)
            })
            .catch((err) => {
                setLoading(false)

                // Jeton expire ou invalide : on renvoie a la connexion
                if (err.response && err.response.status === 401) {
                    onLogout()
                    return
                }

                setError('No se pudieron cargar los productos.')
            })
    }

    function remove(product) {
        const ok = window.confirm('¿Eliminar ' + product.name + ' ?')

        if (!ok) {
            return
        }

        api.delete('/api/admin/products/' + product.id, { headers: authHeader() })
            .then(() => load())
            .catch(() => setError('No se pudo eliminar el producto.'))
    }

    function logout() {
        api.post('/api/logout', {}, { headers: authHeader() })
            .then(() => onLogout())
            .catch(() => onLogout())
    }

    return (
        <div className="min-h-screen bg-cream">
            <div className="bg-forest text-cream">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6">
                    <div>
                        <p className="text-[10px] tracking-[0.3em] text-gold uppercase">
                            Administración
                        </p>
                        <h1 className="font-display mt-1 text-2xl">Productos</h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] tracking-[0.15em] uppercase">
                        <button
                            onClick={onNew}
                            className="bg-gold px-5 py-3 text-forest transition hover:bg-gold-light"
                        >
                            Nuevo producto
                        </button>
                        <button onClick={onBack} className="text-cream/70 hover:text-gold">
                            Ver la tienda
                        </button>
                        <button onClick={logout} className="text-cream/70 hover:text-gold">
                            Cerrar sesión
                        </button>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-6xl px-6 py-10">
                {error && (
                    <p className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </p>
                )}

                {loading && (
                    <p className="py-16 text-center text-sm tracking-[0.2em] text-forest/40 uppercase">
                        Cargando
                    </p>
                )}

                {!loading && (
                    <div className="overflow-x-auto border border-forest/10 bg-white">
                        <table className="w-full text-sm">
                            <thead className="border-b border-forest/10">
                                <tr className="text-left text-[10px] tracking-[0.15em] text-forest/50 uppercase">
                                    <th className="p-4">Foto</th>
                                    <th className="p-4">Nombre</th>
                                    <th className="p-4">Categoría</th>
                                    <th className="p-4 text-right">Precio</th>
                                    <th className="p-4 text-right">Stock</th>
                                    <th className="p-4">Estado</th>
                                    <th className="p-4"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((p) => (
                                    <tr key={p.id} className="border-b border-forest/5">
                                        <td className="p-4">
                                            <Vignette product={p} />
                                        </td>
                                        <td className="p-4 text-forest">{p.name}</td>
                                        <td className="p-4 text-forest/60">{p.category.name}</td>
                                        <td className="p-4 text-right text-forest">
                                            {formatPrice(p.price)}
                                        </td>
                                        <td className="p-4 text-right text-forest/70">{p.stock}</td>
                                        <td className="p-4">
                                            <Estado active={p.is_active} />
                                        </td>
                                        <td className="p-4 text-right whitespace-nowrap">
                                            <button
                                                onClick={() => onEdit(p)}
                                                className="mr-4 text-[11px] tracking-widest text-forest uppercase hover:text-gold"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => remove(p)}
                                                className="text-[11px] tracking-widest text-red-600 uppercase hover:underline"
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

function Vignette({ product }) {
    if (!product.image_url) {
        return (
            <div className="flex h-12 w-12 items-center justify-center bg-cream">
                <span className="font-display text-gold/60">{product.name.charAt(0)}</span>
            </div>
        )
    }

    return (
        <img src={product.image_url} alt={product.name} className="h-12 w-12 object-cover" />
    )
}

function Estado({ active }) {
    if (active) {
        return (
            <span className="border border-forest/20 px-2 py-1 text-[10px] tracking-widest text-forest uppercase">
                Activo
            </span>
        )
    }

    return (
        <span className="border border-forest/10 px-2 py-1 text-[10px] tracking-widest text-forest/40 uppercase">
            Inactivo
        </span>
    )
}
