import { useState } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import Cart from './components/Cart'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Cabina from './pages/Cabina'
import Nosotros from './pages/Nosotros'
import Checkout from './pages/Checkout'
import Confirmation from './pages/Confirmation'
import AdminLogin from './pages/AdminLogin'
import AdminProducts from './pages/AdminProducts'
import AdminProductForm from './pages/AdminProductForm'

// Si l'adresse se termine par #admin, on ouvre directement l'administration.
// Exemple : http://localhost:5173/#admin
function pageDeDepart() {
    if (window.location.hash !== '#admin') {
        return 'inicio'
    }

    if (localStorage.getItem('token')) {
        return 'admin-products'
    }

    return 'admin-login'
}

function App() {
    // Le panier : une liste de { product, quantity }
    const [cart, setCart] = useState([])

    // La page affichee
    const [page, setPage] = useState(pageDeDepart())

    // La reponse de l'API apres la creation de la commande
    const [pedido, setPedido] = useState(null)

    // Le jeton admin, relu au demarrage depuis le navigateur
    const [token, setToken] = useState(localStorage.getItem('token'))

    // Le produit en cours de modification (null = creation)
    const [editing, setEditing] = useState(null)

    function navigate(cible) {
        setPage(cible)
        window.scrollTo(0, 0)
    }

    function addToCart(product) {
        const ligne = cart.find((l) => l.product.id === product.id)

        // Deja dans le panier : on augmente la quantite
        if (ligne) {
            changeQuantity(product.id, ligne.quantity + 1)
            return
        }

        setCart([...cart, { product: product, quantity: 1 }])
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

    function orderCreated(data) {
        setPedido(data)
        setCart([])
        navigate('confirmacion')
    }

    function backToShop() {
        setPedido(null)
        navigate('tienda')
    }

    function goToAdmin() {
        if (token) {
            navigate('admin-products')
            return
        }

        navigate('admin-login')
    }

    function saveToken(nouveauJeton) {
        localStorage.setItem('token', nouveauJeton)
        setToken(nouveauJeton)
        navigate('admin-products')
    }

    function clearToken() {
        localStorage.removeItem('token')
        setToken(null)
        navigate('inicio')
    }

    // Bouton « Nuevo producto » : aucun produit a modifier
    function newProduct() {
        setEditing(null)
        navigate('admin-form')
    }

    // Bouton « Editar » d'une ligne
    function editProduct(product) {
        setEditing(product)
        navigate('admin-form')
    }

    // Le formulaire a enregistre, ou on annule
    function backToList() {
        setEditing(null)
        navigate('admin-products')
    }

    // ---- Les pages d'administration ont leur propre mise en page ----

    if (page === 'admin-login') {
        return <AdminLogin onLogin={saveToken} onBack={() => navigate('inicio')} />
    }

    if (page === 'admin-form') {
        return <AdminProductForm product={editing} onDone={backToList} onCancel={backToList} />
    }

    if (page === 'admin-products') {
        return (
            <AdminProducts
                onLogout={clearToken}
                onBack={() => navigate('inicio')}
                onNew={newProduct}
                onEdit={editProduct}
            />
        )
    }

    // ---- Le site public : en-tete, contenu, pied de page ----

    // La barre du panier est fixee en bas : on reserve la place pour ne pas
    // recouvrir la fin du pied de page.
    let placePourLePanier = ''

    if (page === 'tienda' && cart.length > 0) {
        placePourLePanier = 'pb-24'
    }

    return (
        <div className={'flex min-h-screen flex-col ' + placePourLePanier}>
            <Header
                page={page}
                onNavigate={navigate}
                count={cartCount()}
                onCart={() => navigate('pago')}
            />

            <main className="flex-1">
                {page === 'inicio' && <Home onNavigate={navigate} />}

                {page === 'tienda' && <Catalog onAdd={addToCart} />}

                {page === 'cabina' && <Cabina />}

                {page === 'nosotros' && <Nosotros />}

                {page === 'pago' && (
                    <Checkout
                        cart={cart}
                        total={cartTotal()}
                        onSuccess={orderCreated}
                        onBack={backToShop}
                    />
                )}

                {page === 'confirmacion' && (
                    <Confirmation pedido={pedido} onBack={backToShop} />
                )}
            </main>

            <Footer onNavigate={navigate} onAdmin={goToAdmin} />

            {page === 'tienda' && (
                <Cart
                    cart={cart}
                    total={cartTotal()}
                    count={cartCount()}
                    onChangeQuantity={changeQuantity}
                    onRemove={removeFromCart}
                    onCheckout={() => navigate('pago')}
                />
            )}
        </div>
    )
}

export default App
