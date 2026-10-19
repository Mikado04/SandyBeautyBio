import { useEffect, useState } from 'react'
import api from '../lib/api'
import ProductCard from './ProductCard'
import { useRevelar } from '../lib/revelar'

export default function Tienda({ onAdd, gamaElegida, onGamaChange }) {
    const refCabecera = useRevelar()
    const [categories, setCategories] = useState([])
    const [products, setProducts] = useState([])
    const [meta, setMeta] = useState(null)
    const [category, setCategory] = useState(null)
    // La page affichee, memorisee AVEC la gamme pour laquelle elle a ete choisie.
    // Quand la gamme change (clic sur "Ver Sandy Natur" dans la section Gamas),
    // la page memorisee ne correspond plus : on repart alors de la page 1.
    const [pagina, setPagina] = useState({ gama: gamaElegida, numero: 1 })

    let page = 1

    if (pagina.gama === gamaElegida) {
        page = pagina.numero
    }

    function setPage(numero) {
        setPagina({ gama: gamaElegida, numero: numero })
    }
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Les categories, une seule fois au demarrage
    useEffect(() => {
        api.get('/api/categories')
            .then((res) => setCategories(res.data.data))
            .catch(() => setError('No se pudieron cargar las categorías.'))
    }, [])

    // Les produits, a chaque changement de filtre ou de page
    useEffect(() => {
        setLoading(true)
        setError(null)

        // La gamme est filtree par l'API (?gama=...) : ainsi TOUS les produits de la
        // gamme sont trouves, pas seulement ceux de la page affichee.
        // Une valeur null n'est pas envoyee par axios : sans gamme, on recoit tout.
        api.get('/api/products', { params: { category: category, page: page, gama: gamaElegida } })
            .then((res) => {
                setProducts(res.data.data)
                setMeta(res.data.meta)
                setLoading(false)
            })
            .catch(() => {
                setError('No se pudieron cargar los productos.')
                setLoading(false)
            })
    }, [category, page, gamaElegida])

    function elegirCategoria(slug) {
        setCategory(slug)
        setPage(1)
    }

    function pildoraGama(valor) {
        if (gamaElegida === valor) {
            return 'rounded-full bg-forest px-5 py-2 text-[10px] font-medium tracking-[0.12em] text-white uppercase'
        }

        return 'rounded-full border border-forest/15 bg-white px-5 py-2 text-[10px] font-medium tracking-[0.12em] text-muted uppercase transition hover:border-forest/40'
    }

    function pildoraCategoria(slug) {
        if (category === slug) {
            return 'rounded-full bg-gold px-5 py-2 text-[10px] font-medium tracking-[0.12em] text-white uppercase'
        }

        return 'rounded-full border border-forest/15 bg-white px-5 py-2 text-[10px] font-medium tracking-[0.12em] text-muted uppercase transition hover:border-forest/40'
    }

    // Les produits recus sont deja filtres par l'API (categorie et gamme)
    const lista = products

    return (
        <section id="tienda" className="bg-[#fdfbf7]">
            <div className="mx-auto max-w-7xl px-6 py-20">
                <div
                    ref={refCabecera}
                    className="revelar flex flex-wrap items-end justify-between gap-6"
                >
                    <div>
                        <p className="text-[10px] tracking-[0.2em] text-muted uppercase">
                            Tienda oficial · Envío Malabo 24h
                        </p>
                        <h2 className="titulo mt-3 text-4xl text-forest lg:text-5xl">
                            {meta ? meta.total : ''} fórmulas vivas de Bioko
                        </h2>
                    </div>

                    {/* Filtre par gamme : toujours visible, l'API fait le tri */}
                    <div className="flex flex-wrap gap-2" aria-label="Filtrar por gama">
                        <button onClick={() => onGamaChange(null)} className={pildoraGama(null)}>
                            Todas
                        </button>
                        <button
                            onClick={() => onGamaChange('SANDY NATUR')}
                            className={pildoraGama('SANDY NATUR')}
                        >
                            Sandy Natur
                        </button>
                        <button
                            onClick={() => onGamaChange('BELLA ECUATOGUINEANA BIO')}
                            className={pildoraGama('BELLA ECUATOGUINEANA BIO')}
                        >
                            Bella BIO
                        </button>
                    </div>
                </div>

                <nav className="mt-8 flex flex-wrap gap-2">
                    <button onClick={() => elegirCategoria(null)} className={pildoraCategoria(null)}>
                        Todos
                    </button>

                    {categories.map((c) => (
                        <button
                            key={c.id}
                            onClick={() => elegirCategoria(c.slug)}
                            className={pildoraCategoria(c.slug)}
                        >
                            {c.name}
                        </button>
                    ))}
                </nav>

                {error && (
                    <p className="mt-10 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </p>
                )}

                {loading && (
                    <p className="mt-20 text-center text-[11px] tracking-[0.2em] text-muted uppercase">
                        Cargando
                    </p>
                )}

                {!loading && lista.length === 0 && (
                    <p className="mt-20 text-center text-sm text-muted">
                        Ningún producto en esta selección.
                    </p>
                )}

                {!loading && lista.length > 0 && (
                    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {lista.map((product, i) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAdd={onAdd}
                                indice={i}
                            />
                        ))}
                    </div>
                )}

                {!loading && meta && meta.last_page > 1 && (
                    <div className="mt-14 flex items-center justify-center gap-6">
                        <button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                            className="rounded-full border border-forest/15 bg-white px-6 py-2.5 text-[10px] tracking-[0.12em] text-forest uppercase disabled:opacity-30"
                        >
                            Anterior
                        </button>

                        <span className="text-sm text-muted">
                            {meta.current_page} / {meta.last_page}
                        </span>

                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page === meta.last_page}
                            className="rounded-full border border-forest/15 bg-white px-6 py-2.5 text-[10px] tracking-[0.12em] text-forest uppercase disabled:opacity-30"
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </div>
        </section>
    )
}
