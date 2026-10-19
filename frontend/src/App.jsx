import { useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import Gamas from './components/Gamas'
import Tienda from './components/Tienda'
import Masajes from './components/Masajes'
import Nosotros from './components/Nosotros'
import Contacto from './components/Contacto'
import Footer from './components/Footer'
import Cart from './components/Cart'
import ReservaModal from './components/ReservaModal'
import Checkout from './pages/Checkout'
import Confirmation from './pages/Confirmation'
import AdminLogin from './pages/AdminLogin'
import AdminProducts from './pages/AdminProducts'
import AdminProductForm from './pages/AdminProductForm'
import AdminPedidos from './pages/AdminPedidos'
import AdminPedidoDetalle from './pages/AdminPedidoDetalle'
import RetornoPago from './pages/RetornoPago'

// Retour de FedaPay : l'adresse contient ?pedido=SB-2026-0002&status=...&id=...
// Renvoie la reference de la commande, ou null si on n'arrive pas de FedaPay.
function referenciaDeRetorno() {
    const parametros = new URLSearchParams(window.location.search)
    return parametros.get('pedido')
}

// Retour Kkiapay : l'adresse contient aussi &transaction_id=... (null sinon)
function transaccionDeRetorno() {
    const parametros = new URLSearchParams(window.location.search)
    return parametros.get('transaction_id')
}

// Si l'adresse contient ?pedido=..., on affiche le resultat du paiement.
// Si elle se termine par #admin, on ouvre directement l'administration.
function pageDeDepart() {
    if (referenciaDeRetorno()) {
        return 'retorno-pago'
    }

    if (window.location.hash !== '#admin') {
        return 'tienda-unica'
    }

    // Connecte : l'administration s'ouvre sur les commandes (le travail du jour)
    if (localStorage.getItem('token')) {
        return 'admin-pedidos'
    }

    return 'admin-login'
}

function App() {
    // Le panier : une liste de { product, quantity }
    const [cart, setCart] = useState([])

    // Le tiroir du panier est-il ouvert ?
    const [cartAbierto, setCartAbierto] = useState(false)

    // La page affichee : la page unique, le paiement, ou l'administration
    const [page, setPage] = useState(pageDeDepart())

    // La gamme choisie dans la boutique (null = toutes)
    const [gama, setGama] = useState(null)

    // La fenetre de reservation : fermee, ou ouverte sur un service
    const [reservaAbierta, setReservaAbierta] = useState(false)
    const [servicioElegido, setServicioElegido] = useState(null)

    // La reponse de l'API apres la creation de la commande
    const [pedido, setPedido] = useState(null)

    // Le jeton admin, relu au demarrage depuis le navigateur
    const [token, setToken] = useState(localStorage.getItem('token'))

    // Le produit en cours de modification (null = creation)
    const [editing, setEditing] = useState(null)

    // La reference de la commande ouverte dans l'administration (fiche commande)
    const [pedidoAdmin, setPedidoAdmin] = useState(null)

    function addToCart(product) {
        const ligne = cart.find((l) => l.product.id === product.id)

        // Deja dans le panier : on augmente la quantite
        if (ligne) {
            changeQuantity(product.id, ligne.quantity + 1)
            setCartAbierto(true)
            return
        }

        setCart([...cart, { product: product, quantity: 1 }])
        setCartAbierto(true)
    }

    function changeQuantity(productId, quantity) {
        // Quantite tombee a zero : on retire la ligne
        if (quantity < 1) {
            removeFromCart(productId)
            return
        }

        const newCart = cart.map((l) => {
            if (l.product.id === productId) {
                return { product: l.product, quantity: quantity }
            }

            return l
        })

        setCart(newCart)
    }

    function removeFromCart(productId) {
        const newCart = cart.filter((l) => l.product.id !== productId)
        setCart(newCart)
    }

    // Montant total du panier, en XAF
    function cartTotal() {
        let total = 0

        for (const ligne of cart) {
            total = total + ligne.product.price * ligne.quantity
        }

        return total
    }

    // Nombre d'articles (2 cremas + 1 serum = 3)
    function cartCount() {
        let count = 0

        for (const ligne of cart) {
            count = count + ligne.quantity
        }

        return count
    }

    function irAlPago() {
        setCartAbierto(false)
        setPage('pago')
        window.scrollTo(0, 0)
    }

    function orderCreated(data) {
        setPedido(data)
        setCart([])
        setPage('confirmacion')
        window.scrollTo(0, 0)
    }

    function volverALaTienda() {
        setPedido(null)
        setPage('tienda-unica')
        window.scrollTo(0, 0)
    }

    // Depuis la page de retour FedaPay : on retire ?pedido=... de l'adresse,
    // sinon un rechargement de la page rouvrirait le resultat du paiement.
    function salirDelRetorno() {
        window.history.replaceState(null, '', window.location.pathname)
        volverALaTienda()
    }

    // Bouton d'une gamme depuis la section Gamas : on filtre et on descend
    function verGama(clave) {
        setGama(clave)

        const seccion = document.getElementById('tienda')

        if (seccion) {
            seccion.scrollIntoView({ behavior: 'smooth' })
        }
    }

    // Ouvre la fenetre de reservation. Sans argument : aucun service preselectionne.
    function abrirReserva(clave) {
        setServicioElegido(clave)
        setReservaAbierta(true)
    }

    function goToAdmin() {
        if (token) {
            setPage('admin-pedidos')
            return
        }

        setPage('admin-login')
    }

    function saveToken(nouveauJeton) {
        localStorage.setItem('token', nouveauJeton)
        setToken(nouveauJeton)
        setPage('admin-pedidos')
    }

    // Onglets du bandeau d'administration : 'pedidos' ou 'productos'
    function irASeccionAdmin(seccion) {
        if (seccion === 'productos') {
            setPage('admin-products')
        } else {
            setPage('admin-pedidos')
        }

        window.scrollTo(0, 0)
    }

    function verPedido(referencia) {
        setPedidoAdmin(referencia)
        setPage('admin-pedido')
        window.scrollTo(0, 0)
    }

    function volverAPedidos() {
        setPedidoAdmin(null)
        setPage('admin-pedidos')
    }

    function clearToken() {
        localStorage.removeItem('token')
        setToken(null)
        setPage('tienda-unica')
    }

    function newProduct() {
        setEditing(null)
        setPage('admin-form')
    }

    function editProduct(product) {
        setEditing(product)
        setPage('admin-form')
    }

    function backToList() {
        setEditing(null)
        setPage('admin-products')
    }

    // ---- L'administration a sa propre mise en page ----

    if (page === 'admin-login') {
        return <AdminLogin onLogin={saveToken} onBack={volverALaTienda} />
    }

    if (page === 'admin-form') {
        return <AdminProductForm product={editing} onDone={backToList} onCancel={backToList} />
    }

    if (page === 'admin-products') {
        return (
            <AdminProducts
                onLogout={clearToken}
                onBack={volverALaTienda}
                onNew={newProduct}
                onEdit={editProduct}
                onSeccion={irASeccionAdmin}
            />
        )
    }

    if (page === 'admin-pedidos') {
        return (
            <AdminPedidos
                onVerPedido={verPedido}
                onSeccion={irASeccionAdmin}
                onBack={volverALaTienda}
                onLogout={clearToken}
            />
        )
    }

    if (page === 'admin-pedido') {
        return (
            <AdminPedidoDetalle
                referencia={pedidoAdmin}
                onVolver={volverAPedidos}
                onSeccion={irASeccionAdmin}
                onBack={volverALaTienda}
                onLogout={clearToken}
            />
        )
    }

    // ---- Le tunnel de commande ----

    if (page === 'pago') {
        return (
            <Checkout
                cart={cart}
                total={cartTotal()}
                onSuccess={orderCreated}
                onBack={volverALaTienda}
            />
        )
    }

    if (page === 'confirmacion') {
        return <Confirmation pedido={pedido} onBack={volverALaTienda} />
    }

    if (page === 'retorno-pago') {
        return (
            <RetornoPago
                referencia={referenciaDeRetorno()}
                transaccionKkiapay={transaccionDeRetorno()}
                onBack={salirDelRetorno}
            />
        )
    }

    // ---- La page unique ----

    return (
        <>
            <Header
                count={cartCount()}
                onCart={() => setCartAbierto(true)}
                onReservar={() => abrirReserva(null)}
            />

            <main>
                <Hero onReservar={() => abrirReserva(null)} />
                <Gamas onVerGama={verGama} />
                <Tienda onAdd={addToCart} gamaElegida={gama} onGamaChange={setGama} />
                <Masajes onReservar={abrirReserva} />
                <Nosotros />
                <Contacto />
            </main>

            <Footer onAdmin={goToAdmin} />

            <Cart
                abierto={cartAbierto}
                cart={cart}
                total={cartTotal()}
                onClose={() => setCartAbierto(false)}
                onChangeQuantity={changeQuantity}
                onRemove={removeFromCart}
                onCheckout={irAlPago}
            />

            {reservaAbierta && (
                <ReservaModal
                    servicioInicial={servicioElegido}
                    onClose={() => setReservaAbierta(false)}
                />
            )}
        </>
    )
}

export default App
