import api, { authHeader } from '../lib/api'
import emblema from '../assets/emblema.png'

// Bandeau vert commun a toutes les pages d'administration :
// embleme, onglets Pedidos / Productos, "Ver la tienda" et "Cerrar sesion".
// seccion = 'pedidos' ou 'productos' (l'onglet actif)
export default function AdminBarra({ seccion, onSeccion, onBack, onLogout }) {
    function logout() {
        // Meme si l'API ne repond pas, on deconnecte cote navigateur
        api.post('/api/logout', {}, { headers: authHeader() })
            .then(() => onLogout())
            .catch(() => onLogout())
    }

    return (
        <header className="bg-forest text-cream">
            <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-8">
                <div className="flex flex-wrap items-center gap-4 sm:gap-7">
                    <div className="flex items-center gap-3">
                        <img src={emblema} alt="Sandy Beauty" className="h-10 w-10 rounded-full bg-cream object-contain" />
                        <div className="flex flex-col gap-0.5">
                            <span className="titulo text-[19px] leading-none">Sandy Beauty</span>
                            <span className="text-[9.5px] tracking-[0.24em] text-gold uppercase">Administración</span>
                        </div>
                    </div>

                    <nav aria-label="Secciones" className="flex gap-1">
                        <Pestana activa={seccion === 'pedidos'} onClick={() => onSeccion('pedidos')}>
                            Pedidos
                        </Pestana>
                        <Pestana activa={seccion === 'productos'} onClick={() => onSeccion('productos')}>
                            Productos
                        </Pestana>
                    </nav>
                </div>

                <div className="flex gap-2.5">
                    <button onClick={onBack} className="boton-contorno-claro">
                        Ver la tienda
                    </button>
                    <button onClick={logout} className="boton-contorno-claro">
                        Cerrar sesión
                    </button>
                </div>
            </div>
        </header>
    )
}

function Pestana({ activa, onClick, children }) {
    if (activa) {
        return (
            <button aria-current="page" className="rounded-full bg-cream/15 px-4 py-2.5 text-[13px] font-medium text-white">
                {children}
            </button>
        )
    }

    return (
        <button onClick={onClick} className="rounded-full px-4 py-2.5 text-[13px] text-cream/75 transition-colors hover:bg-cream/10 hover:text-white">
            {children}
        </button>
    )
}
