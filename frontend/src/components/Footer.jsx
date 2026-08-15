import { MARCA, CERTIFICACIONES } from '../lib/marca'

export default function Footer({ onNavigate, onAdmin }) {
    return (
        <footer className="mt-24 bg-forest text-cream">
            <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-4">
                <div className="md:col-span-2">
                    <p className="font-display text-2xl">{MARCA.nombre}</p>
                    <p className="mt-1 text-[10px] tracking-[0.3em] text-gold uppercase">
                        {MARCA.razonSocial}
                    </p>

                    <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream/70">
                        Biocosmética de selva. Cultivamos, prensamos, formulamos y masajeamos en
                        Malabo. 100% fabricado en Guinea Ecuatorial.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-2">
                        {CERTIFICACIONES.map((c) => (
                            <span
                                key={c}
                                className="rounded-full border border-gold/40 px-3 py-1 text-[10px] tracking-widest text-gold uppercase"
                            >
                                {c}
                            </span>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="text-xs tracking-[0.2em] text-gold uppercase">Tienda</p>
                    <div className="mt-4 flex flex-col gap-2 text-sm text-cream/70">
                        <button onClick={() => onNavigate('tienda')} className="text-left hover:text-gold">
                            Catálogo
                        </button>
                        <button onClick={() => onNavigate('cabina')} className="text-left hover:text-gold">
                            Cabina Malabo
                        </button>
                        <button onClick={() => onNavigate('nosotros')} className="text-left hover:text-gold">
                            Nuestra historia
                        </button>
                    </div>
                </div>

                <div>
                    <p className="text-xs tracking-[0.2em] text-gold uppercase">Contacto</p>
                    <div className="mt-4 flex flex-col gap-2 text-sm text-cream/70">
                        <span>{MARCA.direccion}</span>
                        <span>WhatsApp {MARCA.whatsapp}</span>
                        <span>{MARCA.email}</span>
                    </div>
                </div>
            </div>

            <div className="border-t border-cream/10">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5 text-[11px] text-cream/50">
                    <span>
                        © {new Date().getFullYear()} {MARCA.razonSocial} · Malabo, Guinea Ecuatorial
                    </span>
                    <button
                        onClick={onAdmin}
                        className="border border-cream/25 px-4 py-2 text-[10px] tracking-[0.2em] text-cream/70 uppercase transition hover:border-gold hover:text-gold"
                    >
                        Administración
                    </button>
                </div>
            </div>
        </footer>
    )
}
