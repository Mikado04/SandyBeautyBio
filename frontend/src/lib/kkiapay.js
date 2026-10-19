// Fenetre de paiement Kkiapay (cartes Visa/Mastercard).
//
// Le script officiel n'est telecharge qu'au moment du paiement :
// les visiteurs qui ne paient pas par carte ne le chargent jamais.
// Documentation : https://docs.kkiapay.me/v1/plugin-et-sdk/sdk-javascript

const URL_SCRIPT = 'https://cdn.kkiapay.me/k.js'

// Le chargement en cours ou termine (null = jamais lance)
let chargement = null

export function chargerKkiapay() {
    // Deja charge, ou en cours : on renvoie le meme chargement
    if (chargement) {
        return chargement
    }

    chargement = new Promise(function (resolve, reject) {
        const script = document.createElement('script')
        script.src = URL_SCRIPT

        script.onload = function () {
            resolve()
        }

        script.onerror = function () {
            // On autorise un nouvel essai au prochain clic
            chargement = null
            reject(new Error('No se pudo cargar Kkiapay'))
        }

        document.body.appendChild(script)
    })

    return chargement
}

// Les ecouteurs de Kkiapay sont globaux a la page : si on les enregistrait a chaque
// ouverture, un paiement declencherait plusieurs fois la suite. On les pose donc
// UNE seule fois, et ils appellent les fonctions de la derniere ouverture.
let ecouteursPoses = false
let quandPaye = null
let quandEchec = null

// pedido = la reponse de POST /api/orders pour un paiement Kkiapay
// siPaye(idTransaction) et siEchec() sont appelees a la fin du paiement
export function ouvrirKkiapay(pedido, siPaye, siEchec) {
    quandPaye = siPaye
    quandEchec = siEchec

    if (!ecouteursPoses) {
        window.addSuccessListener(function (reponse) {
            if (!reponse || !reponse.transactionId) {
                console.error('Kkiapay : reponse sans transactionId', reponse)
                return
            }

            if (quandPaye) {
                quandPaye(reponse.transactionId)
            }
        })

        window.addFailedListener(function (erreur) {
            // JSON.stringify affiche tout le detail d'un coup, sans devoir deplier
            // chaque objet dans la console (ex. reason.problems)
            console.warn('Kkiapay : paiement echoue', JSON.stringify(erreur, null, 2))

            if (quandEchec) {
                quandEchec()
            }
        })

        ecouteursPoses = true
    }

    const options = {
        amount: pedido.payment.amount,
        key: pedido.payment.public_key,
        sandbox: pedido.payment.sandbox,
        // La reference de commande voyage avec la transaction :
        // le backend verifie qu'elle correspond, le webhook s'en servira.
        partnerId: pedido.reference,
        data: pedido.reference,
        name: pedido.payment.name,
        position: 'center',
        theme: '#1b4332',
    }

    if (pedido.payment.email) {
        options.email = pedido.payment.email
    }

    window.openKkiapayWidget(options)
}
