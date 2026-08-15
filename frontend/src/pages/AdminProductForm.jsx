import { useEffect, useState } from 'react'
import api, { authHeader } from '../lib/api'

export default function AdminProductForm({ product, onDone, onCancel }) {
    // Valeurs de depart : vides pour une creation, remplies pour une modification
    let init = {
        name: '',
        category_id: '',
        description: '',
        size: '',
        price: '',
        stock: '',
        highlight: '',
        is_active: true,
    }

    if (product) {
        init = {
            name: product.name,
            category_id: product.category_id,
            description: product.description || '',
            size: product.size || '',
            price: product.price,
            stock: product.stock,
            highlight: product.highlight || '',
            is_active: product.is_active,
        }
    }

    const [categories, setCategories] = useState([])
    const [name, setName] = useState(init.name)
    const [categoryId, setCategoryId] = useState(init.category_id)
    const [description, setDescription] = useState(init.description)
    const [size, setSize] = useState(init.size)
    const [price, setPrice] = useState(init.price)
    const [stock, setStock] = useState(init.stock)
    const [highlight, setHighlight] = useState(init.highlight)
    const [isActive, setIsActive] = useState(init.is_active)
    const [image, setImage] = useState(null)

    const [sending, setSending] = useState(false)
    const [error, setError] = useState(null)
    const [fieldErrors, setFieldErrors] = useState({})

    useEffect(() => {
        api.get('/api/categories')
            .then((res) => setCategories(res.data.data))
            .catch(() => setError('No se pudieron cargar las categorías.'))
    }, [])

    function submit(event) {
        event.preventDefault()

        setSending(true)
        setError(null)
        setFieldErrors({})

        // Un fichier ne peut pas voyager en JSON : on utilise FormData
        const data = new FormData()
        data.append('name', name)
        data.append('category_id', categoryId)
        data.append('description', description)
        data.append('size', size)
        data.append('price', price)
        data.append('stock', stock)
        data.append('highlight', highlight)

        let actif = '0'

        if (isActive) {
            actif = '1'
        }

        data.append('is_active', actif)

        // Pas de nouvelle photo choisie : on n'envoie rien, l'ancienne est conservee
        if (image) {
            data.append('image', image)
        }

        // Creation ou modification : seule l'URL change
        let url = '/api/admin/products'

        if (product) {
            url = '/api/admin/products/' + product.id
        }

        api.post(url, data, { headers: authHeader() })
            .then(() => onDone())
            .catch((err) => {
                setSending(false)

                if (err.response && err.response.status === 422) {
                    setError(err.response.data.message)

                    if (err.response.data.errors) {
                        setFieldErrors(err.response.data.errors)
                    }

                    return
                }

                setError('No se pudo guardar el producto.')
            })
    }

    function errorFor(champ) {
        if (!fieldErrors[champ]) {
            return null
        }

        return <p className="mt-1 text-xs text-red-600">{fieldErrors[champ][0]}</p>
    }

    let titre = 'Nuevo producto'

    if (product) {
        titre = 'Editar producto'
    }

    const champ =
        'mt-1 w-full border border-forest/20 bg-white px-4 py-3 text-sm text-forest outline-none focus:border-gold'

    return (
        <div className="min-h-screen bg-cream">
            <div className="bg-forest text-cream">
                <div className="mx-auto max-w-2xl px-6 py-6">
                    <button
                        onClick={onCancel}
                        className="text-[11px] tracking-[0.2em] text-cream/60 uppercase hover:text-gold"
                    >
                        ← Volver a la lista
                    </button>
                    <h1 className="font-display mt-2 text-2xl">{titre}</h1>
                </div>
            </div>

            <div className="mx-auto max-w-2xl px-6 py-10">
                {error && (
                    <p className="mb-6 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </p>
                )}

                <form onSubmit={submit} className="border border-forest/10 bg-white p-6">
                    <div>
                        <label className="text-[11px] tracking-widest text-forest/50 uppercase">
                            Nombre *
                        </label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={champ}
                        />
                        {errorFor('name')}
                    </div>

                    <div className="mt-4">
                        <label className="text-[11px] tracking-widest text-forest/50 uppercase">
                            Categoría *
                        </label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className={champ}
                        >
                            <option value="">— Elegir —</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        {errorFor('category_id')}
                    </div>

                    <div className="mt-4">
                        <label className="text-[11px] tracking-widest text-forest/50 uppercase">
                            Descripción
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="2"
                            className={champ}
                        />
                        {errorFor('description')}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[11px] tracking-widest text-forest/50 uppercase">
                                Formato
                            </label>
                            <input
                                value={size}
                                onChange={(e) => setSize(e.target.value)}
                                placeholder="100ml"
                                className={champ}
                            />
                            {errorFor('size')}
                        </div>

                        <div>
                            <label className="text-[11px] tracking-widest text-forest/50 uppercase">
                                Etiqueta
                            </label>
                            <input
                                value={highlight}
                                onChange={(e) => setHighlight(e.target.value)}
                                placeholder="Best Seller"
                                className={champ}
                            />
                            {errorFor('highlight')}
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[11px] tracking-widest text-forest/50 uppercase">
                                Precio en XAF *
                            </label>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className={champ}
                            />
                            {errorFor('price')}
                        </div>

                        <div>
                            <label className="text-[11px] tracking-widest text-forest/50 uppercase">
                                Stock *
                            </label>
                            <input
                                type="number"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                className={champ}
                            />
                            {errorFor('stock')}
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="text-[11px] tracking-widest text-forest/50 uppercase">
                            Foto
                        </label>

                        {product && product.image_url && (
                            <img
                                src={product.image_url}
                                alt={product.name}
                                className="mt-2 h-24 w-24 object-cover"
                            />
                        )}

                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImage(e.target.files[0])}
                            className="mt-2 w-full text-sm text-forest/70"
                        />
                        {errorFor('image')}
                    </div>

                    <label className="mt-6 flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                        />
                        <span className="text-sm text-forest">Visible en la tienda</span>
                    </label>

                    <button
                        type="submit"
                        disabled={sending}
                        className="mt-8 w-full bg-forest py-4 text-[11px] tracking-[0.2em] text-cream uppercase transition hover:bg-gold hover:text-forest disabled:bg-forest/30"
                    >
                        Guardar
                    </button>
                </form>
            </div>
        </div>
    )
}
