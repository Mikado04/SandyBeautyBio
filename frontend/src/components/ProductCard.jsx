import { formatPrice } from '../lib/format'

export default function ProductCard({ product, onAdd }) {
    return (
        <article className="group flex flex-col overflow-hidden rounded-sm border border-forest/10 bg-white transition hover:border-gold/60 hover:shadow-[0_18px_40px_-24px_rgba(27,67,50,0.45)]">
            <div className="relative aspect-square overflow-hidden bg-cream">
                <ProductImage product={product} />

                {product.highlight && (
                    <span className="absolute top-3 left-3 bg-forest px-3 py-1 text-[10px] tracking-[0.15em] text-gold uppercase">
                        {product.highlight}
                    </span>
                )}

                <Agotado product={product} />
            </div>

            <div className="flex flex-1 flex-col p-5">
                <p className="text-[10px] tracking-[0.2em] text-gold uppercase">
                    {product.category.name}
                </p>

                <h3 className="font-display mt-2 text-lg leading-snug text-forest">
                    {product.name}
                </h3>

                <p className="mt-2 flex-1 text-sm leading-relaxed text-forest/60">
                    {product.description}
                </p>

                <div className="mt-5 flex items-end justify-between border-t border-forest/10 pt-4">
                    <div>
                        <p className="font-display text-xl text-forest">
                            {formatPrice(product.price)}
                        </p>
                        <p className="text-[11px] text-forest/50">{product.size}</p>
                    </div>

                    <Stock product={product} />
                </div>

                <button
                    onClick={() => onAdd(product)}
                    disabled={!product.in_stock}
                    className="mt-4 w-full bg-forest py-3 text-[11px] tracking-[0.2em] text-cream uppercase transition hover:bg-gold hover:text-forest disabled:bg-forest/20 disabled:text-forest/40"
                >
                    Añadir al carrito
                </button>
            </div>
        </article>
    )
}

function ProductImage({ product }) {
    // Pas encore de photo : monogramme sur fond creme
    if (!product.image_url) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cream to-cream-dark">
                <span className="font-display text-6xl text-gold/50">
                    {product.name.charAt(0)}
                </span>
            </div>
        )
    }

    return (
        <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
    )
}

function Agotado({ product }) {
    if (product.in_stock) {
        return null
    }

    return (
        <div className="absolute inset-0 flex items-center justify-center bg-cream/70">
            <span className="border border-forest/30 px-4 py-2 text-[11px] tracking-[0.2em] text-forest uppercase">
                Agotado
            </span>
        </div>
    )
}

function Stock({ product }) {
    if (!product.in_stock) {
        return <span className="text-[11px] text-forest/40">Sin existencias</span>
    }

    if (product.stock <= 5) {
        return <span className="text-[11px] text-gold">Últimas {product.stock}</span>
    }

    return <span className="text-[11px] text-forest/40">{product.stock} disponibles</span>
}
