import { formatPrice } from '../lib/format'
import { useRevelar } from '../lib/revelar'

export default function ProductCard({ product, onAdd, indice }) {
    const ref = useRevelar()

    // Decalage par colonne : les cartes d'une meme rangee arrivent l'une apres l'autre
    const retraso = (indice % 3) * 90

    return (
        <article
            ref={ref}
            style={{ transitionDelay: retraso + 'ms' }}
            className="revelar elevar group flex flex-col rounded-2xl bg-[#f5f1eb] p-4 hover:shadow-[0_25px_50px_-35px_rgba(27,67,50,0.6)]"
        >
            <div className="flex items-start justify-between gap-3">
                <Gama product={product} />
                <span className="pt-1 text-[11px] text-muted">{product.category.name}</span>
            </div>

            <div className="relative mt-3 aspect-square overflow-hidden rounded-xl bg-white">
                <Visual product={product} />

                {product.highlight && (
                    <span className="absolute top-3 left-3 rounded-full bg-gold px-3 py-1 text-[9px] font-semibold tracking-[0.12em] text-white uppercase">
                        {product.highlight}
                    </span>
                )}

                <Agotado product={product} />
            </div>

            <h3 className="titulo mt-4 text-lg text-forest">{product.name}</h3>

            <p className="mt-2 flex-1 text-[13px] leading-relaxed text-muted">
                {product.description}
            </p>

            <div className="mt-5 flex items-center justify-between gap-3">
                <span className="titulo text-lg text-forest">{formatPrice(product.price)}</span>

                <button
                    onClick={() => onAdd(product)}
                    disabled={!product.in_stock}
                    className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-[10px] font-medium tracking-[0.12em] text-white uppercase transition hover:bg-forest-2 disabled:bg-forest/25"
                >
                    <span aria-hidden="true">+</span>
                    Añadir
                </button>
            </div>
        </article>
    )
}

// Le visuel : la photo si elle existe, sinon le cercle avec le type de produit
function Visual({ product }) {
    if (product.image_url) {
        return (
            <img
                src={product.image_url}
                alt={product.name}
                // lazy : la photo ne se telecharge que quand la carte approche de l'ecran.
                // Sur une connexion lente, les 12 photos ne partent plus toutes d'un coup.
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
        )
    }

    // Premier mot du nom : Jabon, Aceite, Crema...
    const tipo = product.name.split(' ')[0]

    return (
        <div className="flex h-full w-full items-center justify-center">
            <div className="flex aspect-square w-[62%] items-center justify-center rounded-full bg-gradient-to-br from-[#efe9dd] to-[#e2dccd]">
                <span className="titulo px-2 text-center text-xl text-forest/80">{tipo}</span>
            </div>
        </div>
    )
}

// Le badge de gamme n'apparait que si le produit en a une
function Gama({ product }) {
    if (!product.gama) {
        return <span />
    }

    if (product.gama === 'SANDY NATUR') {
        return (
            <span className="rounded-full border border-forest/15 bg-white px-3 py-1.5 text-[9px] font-medium tracking-[0.12em] text-forest uppercase">
                Sandy Natur
            </span>
        )
    }

    return (
        <span className="rounded-full bg-forest px-3 py-1.5 text-[9px] font-medium tracking-[0.12em] text-white uppercase">
            Bella BIO
        </span>
    )
}

function Agotado({ product }) {
    if (product.in_stock) {
        return null
    }

    return (
        <div className="absolute inset-0 flex items-center justify-center bg-white/75">
            <span className="rounded-full border border-forest/25 px-4 py-2 text-[10px] tracking-[0.15em] text-forest uppercase">
                Agotado
            </span>
        </div>
    )
}
