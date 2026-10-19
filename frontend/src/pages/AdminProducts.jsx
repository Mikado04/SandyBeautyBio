import { useEffect, useState } from 'react'
import api, { authHeader } from '../lib/api'
import { formatPrice } from '../lib/format'
import AdminBarra from '../components/AdminBarra'
import VentanaConfirmar, { Punto } from '../components/VentanaConfirmar'

export default function AdminProducts({ onLogout, onBack, onNew, onEdit, onSeccion }) {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    // Le produit dont on demande la suppression (fenetre ouverte), ou null
    const [aEliminar, setAEliminar] = useState(null)
    // Message vert apres une suppression ("Producto eliminado." ou "desactivado")
    const [aviso, setAviso] = useState(null)

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

    // Le bouton "Eliminar" ouvre d'abord la fenetre de confirmation
    function remove(product) {
        setAviso(null)
        setAEliminar(product)
    }

    // Confirme dans la fenetre : on supprime vraiment
    function confirmarEliminacion() {
        const product = aEliminar
        setAEliminar(null)

        api.delete('/api/admin/products/' + product.id, { headers: authHeader() })
            .then((res) => {
                // Le backend dit s'il a supprime le produit ou seulement desactive
                // (un produit deja commande ne disparait jamais : voir AdminProductController::destroy)
                setAviso(product.name + ' : ' + res.data.message)
                load()
            })
            .catch(() => setError('No se pudo eliminar el producto.'))
    }

    return (
        <div className="min-h-screen bg-cream">
            <AdminBarra seccion="productos" onSeccion={onSeccion} onBack={onBack} onLogout={onLogout} />

            <div className="mx-auto max-w-6xl px-6 py-10">
                <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                    <h1 className="titulo text-[34px] text-forest sm:text-[42px]">Productos</h1>
                    <button
                        onClick={onNew}
                        className="inline-flex min-h-12 items-center rounded-full bg-forest px-6 text-xs font-medium tracking-[0.14em] text-white uppercase hover:bg-forest-2"
                    >
                        + Nuevo producto
                    </button>
                </div>

                {error && (
                    <p className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </p>
                )}

                {aviso && (
                    <p role="status" className="mb-4 rounded-2xl border border-forest/20 bg-[#e8efe9] px-5 py-3.5 text-sm text-forest">
                        {aviso}
                    </p>
                )}

                {aEliminar && (
                    <VentanaConfirmar
                        titulo="¿Eliminar el producto?"
                        subtitulo={aEliminar.name}
                        textoConfirmar="Sí, eliminar"
                        onConfirmar={confirmarEliminacion}
                        onCerrar={() => setAEliminar(null)}
                    >
                        <ul className="flex flex-col gap-2.5 text-[14px] leading-relaxed text-[#4d5e55]">
                            <Punto>El producto y su foto se borran definitivamente.</Punto>
                            <Punto>
                                Si ya aparece en algún pedido, no se borra: se desactiva y deja de
                                verse en la tienda, para conservar el historial de ventas.
                            </Punto>
                        </ul>
                    </VentanaConfirmar>
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
                                    <th className="p-4">Gama</th>
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
                                        <td className="p-4">
                                            <EtiquetaGama gama={p.gama} />
                                        </td>
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
                                                className="boton-contorno boton-mini mr-2"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => remove(p)}
                                                className="boton-peligro boton-mini"
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
                <span className="titulo text-gold/60">{product.name.charAt(0)}</span>
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

// La gamme du produit, ou un avertissement s'il n'en a pas encore :
// un produit sans gamme n'apparait dans aucun des deux filtres de la boutique.
function EtiquetaGama({ gama }) {
    if (gama === 'SANDY NATUR') {
        return (
            <span className="rounded-full bg-cream px-3 py-1 text-[10px] font-medium tracking-wider text-forest uppercase">
                Sandy Natur
            </span>
        )
    }

    if (gama === 'BELLA ECUATOGUINEANA BIO') {
        return (
            <span className="rounded-full bg-forest px-3 py-1 text-[10px] font-medium tracking-wider text-gold uppercase">
                Bella BIO
            </span>
        )
    }

    return (
        <span className="rounded-full border border-dashed border-amber-500 px-3 py-1 text-[10px] font-medium tracking-wider text-amber-700 uppercase">
            Sin gama
        </span>
    )
}
