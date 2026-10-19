import emblema from '../assets/emblema.png'
import { MARCA, enlaceTelefono, enlaceEmail, enlaceInstagram } from '../lib/marca'

// Les coordonnees sont des liens : souligne discret, qui se renforce au survol
const CLASE_ENLACE =
    'underline decoration-forest/30 underline-offset-4 transition-colors hover:text-forest-3 hover:decoration-forest'

export default function Footer({ onAdmin }) {
    return (
        <footer className="border-t border-forest/10 bg-white">
            <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[2fr_1fr]">
                <div>
                    <div className="flex items-center gap-3">
                        <img
                            src={emblema}
                            alt="Sandy Beauty"
                            className="h-9 w-9 rounded-full object-cover"
                        />
                        <span className="titulo text-sm font-semibold tracking-wide text-forest">
                            SANDY BEAUTY
                        </span>
                    </div>

                    <p className="mt-5 max-w-xs text-[13px] leading-relaxed text-muted">
                        Biocosmética de selva. Cultivamos, prensamos, formulamos y masajeamos en
                        Malabo. Certificado OAPI, ISO 9001, 16128, 22716.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-2">
                        <span className="rounded-full bg-cream px-4 py-2 text-[9px] tracking-[0.12em] text-forest uppercase">
                            Pago seguro con tarjeta
                        </span>
                        <span className="rounded-full bg-cream px-4 py-2 text-[9px] tracking-[0.12em] text-forest uppercase">
                            Envío 24h Malabo
                        </span>
                    </div>
                </div>

                <div>
                    <p className="text-[10px] tracking-[0.2em] text-muted uppercase">Contacto</p>
                    <div className="mt-5 flex flex-col items-start gap-3 text-[13px] text-forest">
                        <span>{MARCA.direccion}</span>
                        <a href={enlaceTelefono(MARCA.telefono1)} className={CLASE_ENLACE}>
                            {MARCA.telefono1}
                        </a>
                        <a href={enlaceEmail(MARCA.email)} className={CLASE_ENLACE}>
                            {MARCA.email}
                        </a>
                        <a href={enlaceInstagram(MARCA.instagram)} target="_blank" rel="noreferrer" className={CLASE_ENLACE}>
                            {MARCA.instagram}
                        </a>
                    </div>
                </div>

                {/* Retires pour l'instant (octobre 2026) :
                    - la colonne Legal : ses liens ne menaient nulle part, les pages legales restent a ecrire ;
                    - la newsletter : le bouton n'enregistrait aucune adresse. */}
            </div>

            <div className="border-t border-forest/10">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
                    <span className="text-[10px] tracking-[0.15em] text-muted uppercase">
                        © {new Date().getFullYear()} {MARCA.razonSocial} · Malabo, GE
                    </span>

                    <div className="flex items-center gap-6">
                        <span className="text-[10px] tracking-[0.15em] text-muted uppercase">
                            Hecho con moringa y cacao de Bioko
                        </span>
                        <button
                            onClick={onAdmin}
                            className="boton-contorno boton-mini"
                        >
                            {/* Cadenas : espace reserve a l'administration */}
                            <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="5" y="10.5" width="14" height="10" rx="2" />
                                <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
                            </svg>
                            Admin
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    )
}
