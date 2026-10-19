import { useEffect, useRef } from 'react'

// Ajoute la classe "visible" a un element quand il entre a l'ecran.
// C'est le seul JavaScript des animations : tout le reste est en CSS (index.css).
//
// Utilisation :
//   const ref = useRevelar()
//   <div ref={ref} className="revelar">...</div>
export function useRevelar() {
    const referencia = useRef(null)

    useEffect(() => {
        const elemento = referencia.current

        if (!elemento) {
            return
        }

        const observador = new IntersectionObserver(
            function (entradas) {
                for (const entrada of entradas) {
                    if (entrada.isIntersecting) {
                        entrada.target.classList.add('visible')

                        // Une fois revele, on arrete de surveiller : l'animation ne se rejoue pas
                        observador.unobserve(entrada.target)
                    }
                }
            },
            { threshold: 0.12, rootMargin: '0px 0px -70px 0px' },
        )

        observador.observe(elemento)

        return function () {
            observador.disconnect()
        }
    }, [])

    return referencia
}
