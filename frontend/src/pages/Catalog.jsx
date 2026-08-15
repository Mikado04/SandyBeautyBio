import { useEffect, useState } from 'react'
import api from '../lib/api'
import ProductCard from '../components/ProductCard'

export default function Catalog({ onAdd }) {
    const [categories, setCategories] = useState([])
    const [products, setProducts] = useState([])
    const [meta, setMeta] = useState(null)
    const [category, setCategory] = useState(null)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Charge les categories une seule fois, au demarrage
    useEffect(() => {
        api.get('/api/categories')
            .then((res) => setCategories(res.data.data))
            .catch(() => setError('No se pudieron cargar las categorías.'))
    }, [])

    // Recharge les produits quand la categorie, la recherche ou la page change
    useEffect(() => {
        setLoading(true)
        setError(null)

        api.get('/api/products', { params: { category, search, page } })
            .then((res) => {
                setProducts(res.data.data)
                setMeta(res.data.meta)
                setLoading(false)
            })
            .catch(() => {
                setError('No se pudieron cargar los productos.')
                setLoading(false)
            })
    }, [category, search, page])

    function selectCategory(slug) {
        setCategory(slug)
        setPage(1)
    }

    function onSearch(event) {
        setSearch(event.target.value)
        setPage(1)
    }

    // Bouton de filtre : fonce s'il est actif, clair sinon
    function chipClass(actif) {
        if (actif) {
            return 'border border-forest bg-forest px-5 py-2 text-[11px] tracking-[0.15em] text-cream uppercase'
        }

        return 'border border-forest/20 px-5 py-2 text-[11px] tracking-[0.15em] text-forest/70 uppercase transition hover:border-gold hover:text-forest'
    }

    return (
        <div>
            <section className="bg-forest text-cream">
                <div className="mx-auto max-w-6xl px-6 py-16">
                    <p className="text-[11px] tracking-[0.3em] text-gold uppercase">
                        Tienda oficial
                    </p>

                    <h1 className="font-display mt-5 text-4xl md:text-5xl">
                        Fórmulas de la selva
                    </h1>

                    <p className="mt-5 max-w-xl leading-relaxed text-cream/70">
                        Añade fórmulas de la selva a tu ritual. Envío en 24h en Malabo.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-6 py-12">
                <div className="flex flex-wrap items-center justify-between gap-6">
                    <nav className="flex flex-wrap gap-2">
                        <button
                            onClick={() => selectCategory(null)}
                            className={chipClass(category === null)}
                        >
                            Todos
                        </button>

                        {categories.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => selectCategory(c.slug)}
                                className={chipClass(category === c.slug)}
                            >
                                {c.name}
                                <span className="ml-2 opacity-50">{c.products_count}</span>
                            </button>
                        ))}
                    </nav>

                    <input
                        value={search}
                        onChange={onSearch}
                        placeholder="Buscar un producto..."
                        className="w-full border border-forest/20 bg-white px-4 py-2.5 text-sm text-forest outline-none focus:border-gold md:w-64"
                    />
                </div>

                {error && (
                    <p className="mt-10 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </p>
                )}

                {loading && (
                    <p className="mt-16 text-center text-sm tracking-[0.2em] text-forest/40 uppercase">
                        Cargando
                    </p>
                )}

                {!loading && products.length === 0 && (
                    <p className="mt-16 text-center text-sm text-forest/50">
                        Ningún producto corresponde a tu búsqueda.
                    </p>
                )}

                {!loading && products.length > 0 && (
                    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} onAdd={onAdd} />
                        ))}
                    </div>
                )}

                {!loading && meta && meta.last_page > 1 && (
                    <div className="mt-14 flex items-center justify-center gap-6">
                        <button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                            className="border border-forest/20 px-5 py-2 text-[11px] tracking-[0.15em] text-forest uppercase disabled:opacity-30"
                        >
                            Anterior
                        </button>

                        <span className="text-sm text-forest/60">
                            {meta.current_page} / {meta.last_page}
                        </span>

                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page === meta.last_page}
                            className="border border-forest/20 px-5 py-2 text-[11px] tracking-[0.15em] text-forest uppercase disabled:opacity-30"
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </section>
        </div>
    )
}
