import { useEffect, useRef } from 'react'

// Fenetre de confirmation avant une action qui ne se defait pas
// (annuler une commande, supprimer un produit...). Remplace window.confirm().
//
// L'element <dialog> du navigateur, ouvert avec showModal(), fait deja le travail
// difficile : il bloque le reste de la page, garde la touche Tab a l'interieur,
// et se ferme avec la touche Echap (evenement "cancel").
//
// titulo        : la question, ex. "¿Eliminar el producto?"
// subtitulo     : une ligne sous le titre (reference, nom...)
// textoConfirmar: le texte du bouton rouge, ex. "Sí, eliminar"
// children      : les explications affichees au milieu
export default function VentanaConfirmar({ titulo, subtitulo, textoConfirmar, onConfirmar, onCerrar, children }) {
    const refVentana = useRef(null)

    useEffect(function () {
        const ventana = refVentana.current

        if (ventana && !ventana.open) {
            ventana.showModal()
        }
    }, [])

    // Touche Echap : on laisse React fermer la fenetre (sinon l'etat resterait "ouvert")
    function alCancelar(event) {
        event.preventDefault()
        onCerrar()
    }

    // Clic sur le voile sombre autour de la fenetre : on ferme aussi
    function alClicFuera(event) {
        if (event.target === refVentana.current) {
            onCerrar()
        }
    }

    return (
        <dialog
            ref={refVentana}
            onCancel={alCancelar}
            onClick={alClicFuera}
            aria-labelledby="ventana-titulo"
            className="aparecer-zoom m-auto w-[calc(100%-32px)] max-w-[480px] rounded-[28px] bg-white p-0 text-forest shadow-[0_40px_80px_-30px_rgba(20,52,42,0.55)] backdrop:bg-forest-2/55"
        >
            <div className="flex flex-col gap-5 p-7 sm:p-8">
                <div className="flex items-start gap-4">
                    <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-red-50 shadow-[inset_0_0_0_1px_rgba(185,28,28,0.25)]">
                        <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 9v4" />
                            <path d="M12 17h.01" />
                            <path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
                        </svg>
                    </span>
                    <div className="min-w-0">
                        <h2 id="ventana-titulo" className="titulo text-[26px] leading-tight">
                            {titulo}
                        </h2>
                        {subtitulo && <p className="mt-1 text-sm text-[#5a6b61]">{subtitulo}</p>}
                    </div>
                </div>

                {children}

                <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
                    {/* autoFocus : le bouton sans risque recoit le focus a l'ouverture */}
                    <button autoFocus onClick={onCerrar} className="boton-contorno min-h-12">
                        No, volver
                    </button>
                    <button
                        onClick={onConfirmar}
                        className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#b91c1c] px-6 text-xs font-medium tracking-[0.14em] text-white uppercase transition-colors hover:bg-[#991b1b]"
                    >
                        {textoConfirmar}
                    </button>
                </div>
            </div>
        </dialog>
    )
}

// Une ligne d'explication avec sa puce, pour le contenu de la fenetre
export function Punto({ children }) {
    return (
        <li className="flex gap-2.5">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-forest-3" />
            <span>{children}</span>
        </li>
    )
}
