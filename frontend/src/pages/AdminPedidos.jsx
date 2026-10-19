import { useEffect, useState } from 'react'
import api, { authHeader } from '../lib/api'
import { formatPrice, formatFecha } from '../lib/format'
import { etiquetaEstado, claseEstado, etiquetaPago } from '../lib/pedidos'
import AdminBarra from '../components/AdminBarra'

// Panel de ventes + liste des commandes.
// Design : canevas Claude Design "Sandy Beauty — Maquetas", onglet "Admin · Pedidos".
// API : GET /api/admin/stats et GET /api/admin/orders (AdminOrderController)

// Les filtres de statut, dans l'ordre d'affichage. clave = valeur envoyee a l'API.
const FILTROS = [
    { clave: '', texto: 'Todos', compteur: 'all' },
    { clave: 'paid', texto: 'Por preparar', compteur: 'paid' },
    { clave: 'pending', texto: 'Pendientes de pago', compteur: 'pending' },
    { clave: 'shipped', texto: 'Enviados', compteur: 'shipped' },
    { clave: 'delivered', texto: 'Entregados', compteur: 'delivered' },
    { clave: 'cancelled', texto: 'Anulados', compteur: 'cancelled' },
]

const PERIODOS = [
    { clave: 'hoy', texto: 'Hoy' },
    { clave: 'mes', texto: 'Este mes' },
    { clave: 'mes_anterior', texto: 'Mes anterior' },
]

export default function AdminPedidos({ onVerPedido, onSeccion, onBack, onLogout }) {
    // Le tableau de bord
    const [periodo, setPeriodo] = useState('mes')
    const [stats, setStats] = useState(null)

    // La liste
    const [pedidos, setPedidos] = useState([])
    const [compteurs, setCompteurs] = useState(null)
    const [paginacion, setPaginacion] = useState(null)
    const [filtro, setFiltro] = useState('')
    const [texto, setTexto] = useState('')
    const [busqueda, setBusqueda] = useState('')
    const [pagina, setPagina] = useState(1)
    const [cargando, setCargando] = useState(true)

    const [error, setError] = useState(null)
    // Reference de la commande en train d'etre "marquee envoyee" (bouton desactive)
    const [enCurso, setEnCurso] = useState(null)
    // Augmente apres chaque action : relance les deux chargements
    const [recarga, setRecarga] = useState(0)

    // Erreur d'API : jeton expire -> retour a la connexion, sinon message
    function gererErreur(err, message) {
        if (err.response && err.response.status === 401) {
            onLogout()
            return
        }

        setError(message)
    }

    // ---- Chargement du tableau de bord ----
    useEffect(
        function () {
            api.get('/api/admin/stats', { params: { periodo: periodo }, headers: authHeader() })
                .then(function (res) {
                    setStats(res.data)
                })
                .catch(function (err) {
                    gererErreur(err, 'No se pudieron cargar las estadísticas.')
                })
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [periodo, recarga]
    )

    // ---- Chargement de la liste ----
    useEffect(
        function () {
            const parametres = { page: pagina }

            if (filtro) {
                parametres.status = filtro
            }

            if (busqueda) {
                parametres.search = busqueda
            }

            api.get('/api/admin/orders', { params: parametres, headers: authHeader() })
                .then(function (res) {
                    setPedidos(res.data.pedidos.data)
                    setPaginacion({
                        actual: res.data.pedidos.current_page,
                        ultima: res.data.pedidos.last_page,
                        total: res.data.pedidos.total,
                    })
                    setCompteurs(res.data.compteurs)
                })
                .catch(function (err) {
                    gererErreur(err, 'No se pudieron cargar los pedidos.')
                })
                .finally(function () {
                    setCargando(false)
                })
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [filtro, busqueda, pagina, recarga]
    )

    function elegirFiltro(clave) {
        setCargando(true)
        setFiltro(clave)
        setPagina(1)
    }

    function buscar(event) {
        event.preventDefault()
        setCargando(true)
        setBusqueda(texto.trim())
        setPagina(1)
    }

    function irAPagina(numero) {
        setCargando(true)
        setPagina(numero)
    }

    // Raccourci de la liste : une commande "Por preparar" passe en "Enviado"
    function marcarEnviado(referencia) {
        setEnCurso(referencia)
        setError(null)

        api.post('/api/admin/orders/' + referencia + '/status', { status: 'shipped' }, { headers: authHeader() })
            .then(function () {
                setRecarga(recarga + 1)
            })
            .catch(function (err) {
                let message = 'No se pudo actualizar el pedido.'

                if (err.response && err.response.data && err.response.data.message) {
                    message = err.response.data.message
                }

                gererErreur(err, message)
            })
            .finally(function () {
                setEnCurso(null)
            })
    }

    return (
        <div className="min-h-screen bg-cream text-forest">
            <AdminBarra seccion="pedidos" onSeccion={onSeccion} onBack={onBack} onLogout={onLogout} />

            <main className="mx-auto flex max-w-[1320px] flex-col gap-6 px-4 py-8 sm:px-8 sm:py-9">
                {/* Titre et periode */}
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-[11px] font-semibold tracking-[0.24em] text-[#8a6d35] uppercase">
                            {textoPeriodo(stats)}
                        </p>
                        <h1 className="titulo mt-1.5 text-[34px] sm:text-[42px]">Panel de ventas</h1>
                    </div>

                    <div role="group" aria-label="Periodo" className="flex gap-1.5 rounded-full bg-white p-1.5 shadow-[inset_0_0_0_1px_rgba(27,67,50,0.1)]">
                        {PERIODOS.map((p) => (
                            <BotonPeriodo key={p.clave} activo={periodo === p.clave} onClick={() => setPeriodo(p.clave)}>
                                {p.texto}
                            </BotonPeriodo>
                        ))}
                    </div>
                </div>

                {error && (
                    <p className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</p>
                )}

                {/* Indicateurs */}
                <Indicadores stats={stats} onPorPreparar={() => elegirFiltro('paid')} />

                {/* Graphique et produits les plus vendus */}
                {stats && (
                    <div className="flex flex-wrap items-stretch gap-4">
                        <GraficoVentas serie={stats.ventas_por_dia} />
                        <MasVendidos productos={stats.mas_vendidos} />
                    </div>
                )}

                {/* Liste des commandes */}
                <section className="rounded-[22px] bg-white p-4 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3.5">
                        <h2 className="titulo text-[28px]">Pedidos</h2>

                        <form onSubmit={buscar} className="flex w-full gap-2 sm:w-auto">
                            <label htmlFor="buscar-pedido" className="sr-only">
                                Buscar pedido
                            </label>
                            <input
                                id="buscar-pedido"
                                type="search"
                                value={texto}
                                onChange={(e) => setTexto(e.target.value)}
                                placeholder="Referencia, nombre o teléfono"
                                className="h-11 min-w-0 flex-1 rounded-full bg-cream px-4 text-sm outline-none focus:ring-2 focus:ring-gold sm:w-72"
                            />
                            <button type="submit" className="boton-contorno">
                                Buscar
                            </button>
                        </form>
                    </div>

                    <div role="group" aria-label="Filtrar por estado" className="mt-4 flex gap-2 overflow-x-auto pb-1">
                        {FILTROS.map((f) => (
                            <BotonFiltro
                                key={f.clave}
                                filtro={f}
                                activo={filtro === f.clave}
                                compteurs={compteurs}
                                onClick={() => elegirFiltro(f.clave)}
                            />
                        ))}
                    </div>

                    {cargando && (
                        <p className="py-14 text-center text-[11px] tracking-[0.2em] text-muted uppercase">Cargando</p>
                    )}

                    {!cargando && pedidos.length === 0 && (
                        <p className="py-14 text-center text-sm text-muted">Ningún pedido en esta selección.</p>
                    )}

                    {!cargando && pedidos.length > 0 && (
                        <>
                            <TablaPedidos pedidos={pedidos} enCurso={enCurso} onVer={onVerPedido} onEnviar={marcarEnviado} />
                            <TarjetasPedidos pedidos={pedidos} enCurso={enCurso} onVer={onVerPedido} onEnviar={marcarEnviado} />
                        </>
                    )}

                    {!cargando && paginacion && paginacion.ultima > 1 && (
                        <div className="mt-6 flex items-center justify-center gap-5">
                            <button
                                onClick={() => irAPagina(paginacion.actual - 1)}
                                disabled={paginacion.actual === 1}
                                className="boton-contorno disabled:opacity-30"
                            >
                                Anterior
                            </button>
                            <span className="text-sm text-muted">
                                {paginacion.actual} / {paginacion.ultima}
                            </span>
                            <button
                                onClick={() => irAPagina(paginacion.actual + 1)}
                                disabled={paginacion.actual === paginacion.ultima}
                                className="boton-contorno disabled:opacity-30"
                            >
                                Siguiente
                            </button>
                        </div>
                    )}
                </section>
            </main>
        </div>
    )
}

// "Octubre 2026", a partir de la date de debut renvoyee par l'API
function textoPeriodo(stats) {
    if (!stats) {
        return ''
    }

    // midi : evite qu'un decalage horaire fasse basculer au mois precedent
    const date = new Date(stats.desde + 'T12:00:00')
    const texte = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(date)

    if (stats.periodo === 'hoy') {
        return 'Hoy'
    }

    return texte.charAt(0).toUpperCase() + texte.slice(1)
}

function BotonPeriodo({ activo, onClick, children }) {
    if (activo) {
        return (
            <button aria-pressed="true" className="rounded-full bg-forest px-4 py-2 text-[12.5px] font-medium text-white">
                {children}
            </button>
        )
    }

    return (
        <button aria-pressed="false" onClick={onClick} className="rounded-full px-4 py-2 text-[12.5px] text-[#4d5e55] hover:bg-cream">
            {children}
        </button>
    )
}

function BotonFiltro({ filtro, activo, compteurs, onClick }) {
    let nombre = ''

    if (compteurs) {
        nombre = compteurs[filtro.compteur]
    }

    let clases = 'flex-none inline-flex min-h-9 items-center gap-1.5 rounded-full px-3.5 text-[12.5px]'

    if (activo) {
        clases = clases + ' bg-forest font-medium text-white'
    } else if (filtro.clave === 'paid') {
        // "Por preparar" reste mis en avant : c'est la ou il y a du travail
        clases = clases + ' bg-cream font-medium text-forest shadow-[inset_0_0_0_1.5px_#c9a86a]'
    } else {
        clases = clases + ' bg-cream text-forest hover:bg-[#ebe5d9]'
    }

    return (
        <button aria-pressed={activo} onClick={onClick} className={clases}>
            {filtro.texto} <span className="opacity-70">{nombre}</span>
        </button>
    )
}

// Les cinq cartes du haut
function Indicadores({ stats, onPorPreparar }) {
    if (!stats) {
        return <div className="h-[132px] rounded-[22px] bg-white/60" />
    }

    return (
        <section aria-label="Indicadores" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
            <div className="col-span-2 rounded-[22px] bg-forest p-5 text-white lg:col-span-1">
                <p className="text-[11px] tracking-[0.16em] text-gold uppercase">Ventas del periodo</p>
                <p className="titulo mt-3 text-[34px] leading-none">
                    {new Intl.NumberFormat('fr-FR').format(stats.ventas)}{' '}
                    <span className="font-sans text-[13px] text-white/70">XAF</span>
                </p>
                <p className="mt-2.5 text-[12.5px] text-white/75">
                    {stats.pedidos_pagados} {stats.pedidos_pagados === 1 ? 'pedido pagado' : 'pedidos pagados'}
                </p>
            </div>

            <Tarjeta titulo="Ventas de hoy" valor={new Intl.NumberFormat('fr-FR').format(stats.ventas_hoy)} unidad="XAF" detalle={stats.pedidos_hoy + ' pedidos'} />

            <button onClick={onPorPreparar} className="rounded-[22px] bg-[#fff8e8] p-5 text-left shadow-[inset_0_0_0_1.5px_#c9a86a] transition-colors hover:bg-[#fff2d4]">
                <span className="flex items-center gap-2 text-[11px] tracking-[0.16em] text-[#8a6d35] uppercase">
                    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 8l-9-5-9 5 9 5 9-5z" />
                        <path d="M3 8v8l9 5 9-5V8" />
                    </svg>
                    Por preparar
                </span>
                <span className="titulo mt-3 block text-[34px] leading-none text-forest">{stats.por_preparar}</span>
                <span className="mt-2.5 block text-[12.5px] font-medium text-[#8a6d35]">Pagados, por enviar →</span>
            </button>

            <Tarjeta titulo="Pendientes de pago" valor={stats.pendientes} detalle="Esperando el pago" />

            <Tarjeta titulo="Ticket medio" valor={new Intl.NumberFormat('fr-FR').format(stats.ticket_medio)} unidad="XAF" detalle="por pedido pagado" />
        </section>
    )
}

function Tarjeta({ titulo, valor, unidad, detalle }) {
    return (
        <div className="rounded-[22px] bg-white p-5">
            <p className="text-[11px] tracking-[0.16em] text-[#5a6b61] uppercase">{titulo}</p>
            <p className="titulo mt-3 text-[34px] leading-none">
                {valor} {unidad && <span className="font-sans text-[13px] text-[#5a6b61]">{unidad}</span>}
            </p>
            <p className="mt-2.5 text-[12.5px] text-[#5a6b61]">{detalle}</p>
        </div>
    )
}

// Graphique en barres : une barre par jour, une seule serie (pas de legende, le titre la nomme)
function GraficoVentas({ serie }) {
    let maximo = 0
    let mejorDia = null

    for (const dia of serie) {
        if (dia.total > maximo) {
            maximo = dia.total
            mejorDia = dia
        }
    }

    // Phrase lue par les lecteurs d'ecran a la place du graphique
    let resumen = 'Ninguna venta en este periodo.'

    if (mejorDia) {
        resumen = 'Ventas por día. Máximo: ' + formatPrice(mejorDia.total) + ' el ' + fechaCorta(mejorDia.fecha) + '.'
    }

    return (
        <section className="min-w-0 flex-[999_1_520px] rounded-[22px] bg-white p-5 sm:p-6">
            <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-base font-medium">Ventas por día</h2>
                <span className="text-xs text-[#5a6b61]">XAF · pedidos pagados</span>
            </div>

            <div role="img" aria-label={resumen} className="relative mt-5 flex h-[200px] items-end gap-1 border-b border-forest/15">
                <div aria-hidden="true" className="absolute inset-x-0 top-0 border-t border-dashed border-forest/10" />
                <div aria-hidden="true" className="absolute inset-x-0 top-1/2 border-t border-dashed border-forest/10" />

                {serie.map((dia) => (
                    <Barra key={dia.fecha} dia={dia} maximo={maximo} />
                ))}
            </div>

            {serie.length > 0 && (
                <div className="mt-2 flex justify-between text-[11px] text-[#6f7c75]">
                    <span>{fechaCorta(serie[0].fecha)}</span>
                    <span>{fechaCorta(serie[serie.length - 1].fecha)}</span>
                </div>
            )}
        </section>
    )
}

function Barra({ dia, maximo }) {
    let hauteur = 0

    if (maximo > 0) {
        hauteur = Math.round((dia.total / maximo) * 100)
    }

    // title : la bulle d'information au survol de la barre
    return (
        <div className="group relative flex h-full flex-1 items-end" title={fechaCorta(dia.fecha) + ' : ' + formatPrice(dia.total)}>
            <div
                className="w-full rounded-t-[4px] bg-forest-3 group-hover:bg-gold"
                style={{ height: hauteur + '%', minHeight: dia.total > 0 ? '3px' : '0' }}
            />
        </div>
    )
}

// "2026-10-18" -> "18 oct"
function fechaCorta(fecha) {
    const date = new Date(fecha + 'T12:00:00')
    return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(date)
}

function MasVendidos({ productos }) {
    let plusGrand = 0

    for (const p of productos) {
        if (p.unidades > plusGrand) {
            plusGrand = p.unidades
        }
    }

    return (
        <section className="min-w-0 flex-[1_1_340px] rounded-[22px] bg-white p-5 sm:p-6">
            <h2 className="text-base font-medium">Más vendidos</h2>

            {productos.length === 0 && <p className="mt-5 text-sm text-muted">Todavía no hay ventas en este periodo.</p>}

            <ol className="mt-4 flex flex-col gap-3.5">
                {productos.map((p) => (
                    <li key={p.nombre} className="flex flex-col gap-1.5">
                        <div className="flex justify-between gap-3 text-[13.5px]">
                            <span className="min-w-0 truncate">{p.nombre}</span>
                            <span className="flex-none text-[#4d5e55]">
                                {p.unidades} {p.unidades === 1 ? 'ud' : 'uds'} · {formatPrice(p.importe)}
                            </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-cream">
                            <div className="h-1.5 rounded-full bg-forest-3" style={{ width: Math.round((p.unidades / plusGrand) * 100) + '%' }} />
                        </div>
                    </li>
                ))}
            </ol>
        </section>
    )
}

// Sur ordinateur : un tableau
function TablaPedidos({ pedidos, enCurso, onVer, onEnviar }) {
    return (
        <div className="mt-4 hidden overflow-x-auto md:block">
            <table className="w-full min-w-[880px] border-collapse text-[13.5px]">
                <thead>
                    <tr className="text-left text-[10.5px] tracking-[0.14em] text-[#5a6b61] uppercase">
                        <th className="px-3.5 py-3 font-medium">Pedido</th>
                        <th className="px-3.5 py-3 font-medium">Clienta</th>
                        <th className="px-3.5 py-3 font-medium">Artículos</th>
                        <th className="px-3.5 py-3 text-right font-medium">Total</th>
                        <th className="px-3.5 py-3 font-medium">Pago</th>
                        <th className="px-3.5 py-3 font-medium">Estado</th>
                        <th className="px-3.5 py-3">
                            <span className="sr-only">Acciones</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {pedidos.map((o) => (
                        <tr key={o.id} className="border-t border-forest/10">
                            <td className="px-3.5 py-3.5">
                                <p className="titulo text-base">{o.reference}</p>
                                <p className="text-xs text-[#6f7c75]">{formatFecha(o.created_at)}</p>
                            </td>
                            <td className="px-3.5 py-3.5">
                                <p className="font-medium">{o.customer_name}</p>
                                <p className="text-xs text-[#6f7c75]">{o.customer_phone}</p>
                            </td>
                            <td className="px-3.5 py-3.5 text-[#4d5e55]">{textoArticulos(o.items_count)}</td>
                            <td className="px-3.5 py-3.5 text-right font-medium whitespace-nowrap">{formatPrice(o.total, o.currency)}</td>
                            <td className="px-3.5 py-3.5 text-[#4d5e55]">{etiquetaPago(o.payment_method)}</td>
                            <td className="px-3.5 py-3.5">
                                <span className={claseEstado(o.status)}>{etiquetaEstado(o.status)}</span>
                            </td>
                            <td className="px-3.5 py-3.5 text-right whitespace-nowrap">
                                {o.status === 'paid' && (
                                    <button
                                        onClick={() => onEnviar(o.reference)}
                                        disabled={enCurso === o.reference}
                                        className="mr-1.5 inline-flex min-h-[34px] items-center rounded-full bg-forest px-3.5 text-[10.5px] font-medium tracking-[0.12em] text-white uppercase hover:bg-forest-2 disabled:opacity-40"
                                    >
                                        Marcar enviado
                                    </button>
                                )}
                                <button onClick={() => onVer(o.reference)} className="boton-contorno boton-mini">
                                    Ver
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

// Sur telephone : une carte par commande, avec des boutons assez grands pour le doigt
function TarjetasPedidos({ pedidos, enCurso, onVer, onEnviar }) {
    return (
        <div className="mt-4 flex flex-col gap-3 md:hidden">
            {pedidos.map((o) => (
                <article key={o.id} className="flex flex-col gap-3 rounded-[20px] bg-cream/60 p-4">
                    <div className="flex items-start justify-between gap-2.5">
                        <div>
                            <p className="titulo text-[17px]">{o.reference}</p>
                            <p className="text-xs text-[#6f7c75]">{formatFecha(o.created_at)}</p>
                        </div>
                        <span className={claseEstado(o.status)}>{etiquetaEstado(o.status)}</span>
                    </div>

                    <div className="flex justify-between gap-2.5 text-[13.5px]">
                        <span>
                            <span className="font-medium">{o.customer_name}</span>
                            <br />
                            <span className="text-[12.5px] text-[#6f7c75]">
                                {textoArticulos(o.items_count)} · {etiquetaPago(o.payment_method)}
                            </span>
                        </span>
                        <span className="font-medium whitespace-nowrap">{formatPrice(o.total, o.currency)}</span>
                    </div>

                    <div className="flex gap-2">
                        {o.status === 'paid' && (
                            <button
                                onClick={() => onEnviar(o.reference)}
                                disabled={enCurso === o.reference}
                                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-forest text-[11px] font-medium tracking-[0.12em] text-white uppercase disabled:opacity-40"
                            >
                                Marcar enviado
                            </button>
                        )}
                        <button onClick={() => onVer(o.reference)} className="boton-contorno flex-1">
                            Ver pedido
                        </button>
                    </div>
                </article>
            ))}
        </div>
    )
}

function textoArticulos(nombre) {
    if (nombre === 1) {
        return '1 artículo'
    }

    return nombre + ' artículos'
}
