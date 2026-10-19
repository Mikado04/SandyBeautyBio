# Sandy Beauty Bio

Boutique en ligne de biocosmétique fabriquée à Malabo, **Guinée Équatoriale**.
Interface en **espagnol**. Monnaie : **franc CFA (XAF)**.

## Identité visuelle — maquette `Sandy Beauty 01.html`

C'est **la 01** qui fait référence pour le front (la 02 a servi au premier jet du catalogue).
Le front est une **page unique** qui la reproduit section par section.

- Marque : **Sandy Beauty** — raison sociale `Sandy Beauty Biocosmética S.L.U.`,
  Buena Esperanza 1 R15, Malabo. Fondatrice : Sandra Eyang Neogo Belobe
- Deux gammes : **SANDY NATUR** (quotidien accessible) et **BELLA ECUATOGUINEANA BIO** (premium)
- Fond **crème clair** (`#fdfbf7` / `#f7f4ee` / `#f0ebe1`), vert forêt réservé aux
  sections « Nosotros », aux boutons et aux accents
- Couleurs : `#1B4332` vert forêt · `#F5F1EB` crème · `#C9A86A` or
- Typographies : **Bodoni Moda** (titres, via la classe `.titulo`) + **Inter** (texte)
- Logo : `logo-original.png` à la racine ; `frontend/src/assets/emblema.png` en est le
  **carré gauche découpé** (l'emblème circulaire seul), utilisé partout dans l'interface
- Tout est déclaré une seule fois dans `frontend/src/index.css` (bloc `@theme`)
  et `frontend/src/lib/marca.js` (coordonnées, gammes, massages, valeurs, timeline)

**Les 9 sections de la page unique :** en-tête collant · héros · certifications · gammes ·
boutique · massages · nosotros · contact · pied de page. Le panier est un tiroir latéral.

## Pile technique

| Élément | Détail |
| --- | --- |
| Backend | Laravel 12.65 — PHP 8.2.12 — dossier `backend/` |
| Frontend | React 19.2 + Vite 8.2 + Tailwind CSS v4 — dossier `frontend/` |
| Base de données | MariaDB 12.3.2 — base `sandy_beauty_bio` |
| Authentification | Laravel Sanctum, mode SPA par cookie de session |
| Maquette d'origine | `Sandy Beauty 02.html` — référence visuelle et source du catalogue |

## En production — o2switch

| | |
| --- | --- |
| Site | `https://sandybeautybio.com` → `public_html/` (build React) |
| API | `https://api.sandybeautybio.com` → `/home/avmi1176/laravel_sandy/public` |
| Compte admin | `admin@sandybeautybio.com` — accès par `https://sandybeautybio.com/#admin` |

**Quatre pièges rencontrés à la mise en ligne, tous résolus — à ne pas réintroduire :**

1. **Tiger Protect** (pare-feu o2switch) renvoyait un `307` avec un cookie `o2s-chl` sur les
   requêtes `POST`. Une redirection ne porte pas d'en-tête `Access-Control-Allow-Origin`, donc
   le navigateur bloquait tout. Réglé en désactivant « Sécurité par défaut d'o2switch »
   **sur le sous-domaine `api.` uniquement** (à sélectionner dans le menu déroulant en haut :
   Tiger Protect se configure domaine par domaine).
2. **HTTP non redirigé vers HTTPS** : une visite en `http://` produisait une origine différente
   de `FRONTEND_URL` et bloquait tous les appels. Réglé par un `.htaccess` dans `public_html`.
3. **Dossiers `storage/framework/{cache,sessions,views}` absents** : un `.zip` ne transporte pas
   les dossiers vides. Erreur « Please provide a valid cache path ». À recréer à chaque
   déploiement par archive.
4. **Identifiants de base** : cPanel préfixe les noms (`avmi1176_sandy`), pas `sandy`.

Procédure complète : `docs/Deploiement-o2switch.pdf`.

## Lancer le projet

Trois terminaux PowerShell :

```powershell
# 1 — API Laravel (laisser ouvert)
cd e:\Pjets_dan\Sandy\backend ; php artisan serve

# 2 — Front React (laisser ouvert)
cd e:\Pjets_dan\Sandy\frontend ; npm run dev

# 3 — libre, pour les commandes artisan, npm et git
```

Backend sur `http://localhost:8000`, frontend sur `http://localhost:5173`.

## Conventions du projet

- **Les prix sont des entiers**, en XAF. Jamais de décimales, jamais de `float` : le franc
  CFA n'a pas de centimes, et les flottants faussent les totaux de panier.
- **Tous les textes visibles sont en espagnol** : noms de produits, catégories, boutons.
- `Product` et `Category` utilisent le **slug** dans les URL (`getRouteKeyName`).
- Les lignes de commande (`order_items`) **recopient** le nom, la taille et le prix du produit
  au moment de l'achat. Une commande passée ne doit jamais être réaffichée en relisant
  `products` : sinon un changement de prix fausserait rétroactivement les anciennes factures.
- **Commande invitée** : pas de compte client. Les coordonnées sont portées par la commande.
- Toute requête à l'API doit envoyer le header `Accept: application/json`, sinon Laravel
  répond en HTML et renvoie une erreur 500 trompeuse.

## Paiement — le point sensible du projet

Aucun agrégateur classique ne couvre la Guinée Équatoriale : ni CinetPay, ni Paystack, ni
Flutterwave, ni l'API Orange Money Web Payment. C'est **le verrou pour la validation du
projet par le client**.

Deux moyens retenus :

1. **Virement bancaire (BANGE)** — Guinée Équatoriale, en **XAF**. Aujourd'hui sans API :
   le site affiche simplement le RIB et une référence de commande (`SB-2026-0042`), le client
   vire depuis sa banque, puis quelqu'un valide manuellement après vérification du relevé.
   **Piste ouverte** : BANGE a indiqué pouvoir fournir un service d'encaissement en ligne
   intégrable. Lettre de demande officielle rédigée dans
   `docs/Carta-Solicitud-Pasarela-Pago-BANGE.docx` (en espagnol), en attente d'envoi.
2. **FedaPay** — **décision d'octobre 2026 : une filiale a été ouverte au Bénin** pour pouvoir
   encaisser en ligne via FedaPay, en **XOF**. C'est désormais **la solution retenue pour le
   paiement en ligne**. SDK `fedapay/fedapay-php` installé ; `OrderController` crée déjà la
   transaction FedaPay (devise XOF). Encore désactivé (`PAY_FEDAPAY_ENABLED=false`, sandbox).
   **Fait en sandbox (16 octobre 2026)** : clés sandbox branchées, appel FedaPay protégé par
   un try/catch (annule la commande et remet le stock), webhook `POST /api/webhooks/fedapay`
   (`FedaPayWebhookController`, signature vérifiée, idempotent), testé par un message signé
   simulé. Webhook déclaré dans la sandbox vers `https://api.sandybeautybio.com/api/webhooks/fedapay`.
   Adresse de retour FedaPay : `/?pedido=SB-2026-0002&status=approved&id=524370` ; la page
   `frontend/src/pages/RetornoPago.jsx` n'utilise que `pedido` et demande le statut à
   `GET /api/orders/{reference}`, qui **revérifie auprès de FedaPay** (`Transaction::retrieve`)
   si la commande est encore en attente : rattrape un webhook perdu. `show()` ne renvoie
   aucune donnée personnelle (les références se devinent).
   Design de cette page : canevas Claude Design https://claude.ai/artifact/8xcL4cUfNeRdco5kKvsKDd
   (payé, en attente, échec, mobile). Animations en CSS pur, fin de `index.css`.
   Page « Finalizar pedido » (`Checkout.jsx`) refaite d'après l'onglet « Finalizar pedido » du
   même canevas : fil d'étapes, tuiles de paiement, récapitulatif vert, bloc « Hecho en Malabo »
   (valeurs + certifications lues dans `marca.js`). Octobre 2026 : virement et FedaPay masqués
   en local par `PAY_BANK_TRANSFER_ENABLED=false` et `PAY_FEDAPAY_ENABLED=false` (pas en prod).
   Manque : déploiement sur o2switch, puis test réel du webhook en sandbox.
   À prévoir : les paiements abandonnés restent en `pending` et gardent le stock réservé.
   **Point bloquant (16 octobre 2026)** : ni le compte sandbox ni le compte live ne proposent
   la **carte bancaire**. Le compte live n'offre que du Mobile Money d'Afrique de l'Ouest
   (Bénin, Côte d'Ivoire, Togo, Sénégal, Niger, Burkina) : **aucun moyen utilisable par un
   client de Malabo**. Activation de la carte Visa/Mastercard et acceptation des cartes émises
   en Guinée Équatoriale demandées au support FedaPay. Le code n'aura pas à changer : la page
   FedaPay affiche d'elle-même les moyens activés sur le compte.
   **Bascule en production** : `FEDAPAY_ENV=live`, clé `sk_live_`, nouveau webhook dans le
   tableau de bord live et son secret, puis `config:clear`.
   Piège PowerShell 5.1 : `php artisan tinker --execute` exige `--%` juste avant, sinon les
   guillemets internes sont retirés (« Undefined constant »).

3. **Kkiapay** — **décision du 16 octobre 2026** : intégré en plus de FedaPay, via la même
   filiale béninoise, en **XOF**, parce qu'il accepte les **cartes Visa/Mastercard** (FedaPay
   ne les propose pas sur nos comptes). Sandbox : cartes de test et numéros MTN 22961000000.
   **Pas de SDK** : le paquet `kkiapay/kkiapay-php` est en dev-master, figé depuis 2023 et
   bogué (compteur de tentatives jamais remis à zéro, fonction Guzzle retirée). On appelle
   l'API directement avec `Http::` : `POST {base}/api/v1/transactions/status`, corps
   `{transactionId}`, en-têtes `X-API-KEY` (publique), `X-PRIVATE-KEY`, `X-SECRET-KEY` ;
   base `https://api-sandbox.kkiapay.me` ou `https://api.kkiapay.me`. Paiement par widget JS
   (`https://cdn.kkiapay.me/k.js`, `openKkiapayWidget`), toujours **revérifié côté serveur**.
   Webhook : en-tête `x-kkiapay-secret`, événements `transaction.success` / `transaction.failed`.
   **Fait (16 octobre 2026)** : config `payments.kkiapay_*`, moyen `kkiapay` (type `widget`) dans
   `PaymentMethodController` et `store()`, `KkiapayController::confirmar` sur
   `POST /api/orders/{order}/kkiapay` (statut SUCCESS, montant, partnerId, transaction non
   réutilisée). Front : `lib/kkiapay.js` charge `k.js` à la demande ; `Checkout.jsx` ouvre la
   fenêtre et ne recrée jamais la commande ; retour sur `/?pedido=REF&transaction_id=ID`.
   **Paiement sandbox par carte réussi** (SB-2026-0017, transaction l5I1eBukz, 16 octobre 2026).
   Webhook `POST /api/webhooks/kkiapay` (`KkiapayController::webhook`) : secret comparé par
   `hash_equals`, ne traite que `transaction.success`, retrouve la commande par `partnerId` puis
   **appelle `confirmar()`** (aucune logique de paiement en double). Testé par 4 appels simulés.
   Le secret est choisi par nous (`KKIAPAY_WEBHOOK_SECRET`) et saisi dans le tableau de bord.
   **Kkiapay refuse de déclarer un webhook tant que le compte n'est pas activé**, même en
   sandbox (« Veuillez d'abord activer votre compte »). À déclarer après l'activation :
   URL `https://api.sandybeautybio.com/api/webhooks/kkiapay`, événements succès + échecs.
   Le secret sandbox a été montré en capture le 16 octobre 2026 : en générer un nouveau pour la
   production. Reste : activation du compte Kkiapay, déploiement.

XAF et XOF valent exactement la même chose (toutes deux arrimées à l'euro à 655,957) mais
restent deux devises distinctes — d'où la colonne `currency` sur `orders` et `payments`.

Pistes écartées pour l'instant : **Moneroo** (seul agrégateur trouvé couvrant la GQ, en cartes
Visa/Mastercard uniquement) et **Muni Dinero** (portefeuille local, sans API publique,
nécessiterait un accord commercial à Malabo).

## Style de code attendu

Code **simple et explicite**. Pas d'interfaces, pas de motifs de conception, pas de DTO.
Des `if` / `else` lisibles, quitte à se répéter. Une architecture à pilotes avait été mise en
place pour les paiements puis **retirée volontairement** : elle était trop abstraite pour être
déboguée sereinement. Ne pas la réintroduire.

## Avancement

**Fait**

- Sanctum SPA + CORS configurés : front `:5173` autorisé, cookies de session partagés
- Tables `categories` et `products` ; 20 produits et 5 catégories importés de la maquette
- API catalogue : `GET /api/categories`, `GET /api/products` (filtre `?category=`,
  recherche `?search=`, pagination par 12), `GET /api/products/{slug}`
- Front : page catalogue avec filtres par catégorie, cartes produit et pagination
- Tables `orders`, `order_items` et `payments` migrées, avec la colonne `currency`
- `config/payments.php` et `GET /api/payment-methods` : renvoie les moyens activés,
  pilotés par `PAY_BANK_TRANSFER_ENABLED` et `PAY_FEDAPAY_ENABLED` dans le `.env`
- Passe de simplification du code : suppression des `->when()`, `whenLoaded()`,
  `whenCounted()`, ternaires imbriqués et fonctions fléchées, au profit de `if` explicites
- Authentification admin par **jeton Bearer** (Sanctum) — le mode SPA par cookie a été
  abandonné : le rituel CSRF était trop difficile à déboguer
- API admin produits : liste, création, modification, suppression, avec **téléversement
  d'image** (`POST` et non `PUT` : PHP ne lit pas les fichiers envoyés en PUT)
- Front entièrement retravaillé d'après la maquette 01 : pages Inicio, Tienda, Cabina,
  Nosotros, tunnel de commande, back-office

- **Mise en ligne sur o2switch effectuée le 15 août 2026** : catalogue, filtres, recherche,
  panier, tunnel de commande, back-office et connexion admin fonctionnent en production
- **Mise à jour en production le 17 octobre 2026** : contrôleurs FedaPay et Kkiapay, nouvelles
  pages de commande et de retour. En ligne : **seule la carte Kkiapay, en sandbox** (virement et
  FedaPay désactivés). Corrigé au passage dans le `.env` du serveur : `PP_DEBUG` → `APP_DEBUG`,
  RIB/SWIFT d'exemple (`TON_RIB`) vidés, mot de passe de base et `APP_KEY` renouvelés après
  exposition. **Ne jamais coller un `.env` dans la conversation.** 31 produits en base de prod.

**En attente**

- **Validation du projet par le client** : elle dépend de la **mise en place du paiement en
  ligne FedaPay**. Le développement reprend sur ce point (octobre 2026), en **sandbox** tant
  que le compte FedaPay de la filiale béninoise est en examen. Le virement BANGE reste actif :
  la banque développe toujours son agrégateur.

**À faire à la reprise**

- Envoyer la lettre `docs/Carta-Solicitud-Pasarela-Pago-BANGE.docx` — le site est maintenant
  en ligne, ce qui était le prérequis de la banque. Compléter le champ « Dominio previsto »
  avec `sandybeautybio.com`
- Photos des produits (`image_path` vide sur les 20) — à charger via le back-office
- Pages légales : aviso legal, envíos y devoluciones, privacidad (exigées par BANGE) — la colonne « Legal » du
  pied de page a été retirée en attendant (ses liens ne menaient nulle part), ainsi que la
  newsletter (le bouton n'enregistrait rien). Adresse de contact : `contabilidad@sandybeautybio.com`
  (l'adresse de la maquette, `gerencia@sandybeautyeg.com`, n'existait pas). Téléphones et Instagram
  confirmés par Sandra ; tous cliquables (`tel:`, `mailto:`, Instagram) via `lib/marca.js`.
- **Espace « Pedidos » de l'administration — fait en local le 18 octobre 2026, à déployer.**
  Backend `AdminOrderController` : `GET /api/admin/orders` (filtre `status`, recherche `search`,
  compteurs), `GET /api/admin/orders/{ref}`, `POST /api/admin/orders/{ref}/status` (pending→cancelled,
  paid→shipped|cancelled, shipped→delivered ; l'annulation remet le stock ; payée puis annulée =
  remboursement manuel dans Kkiapay), `GET /api/admin/stats?periodo=hoy|mes|mes_anterior` (vente =
  statut paid/shipped/delivered, périodes en heure de Malabo, dates en UTC en base). Migration
  `add_tracking_dates_to_orders_table` (shipped_at, delivered_at, cancelled_at). Front :
  `AdminPedidos.jsx`, `AdminPedidoDetalle.jsx`, bandeau commun `components/AdminBarra.jsx`,
  `lib/pedidos.js` (libellés et badges de statut). L'admin s'ouvre sur les commandes.
  **E-mails (19 octobre 2026)** : SMTP o2switch (`mail.sandybeautybio.com`, 465, `MAIL_SCHEME=smtps`,
  boîte `contabilidad@sandybeautybio.com`). Mailable `AppMailPedidoPagado` + vue Markdown
  `emails/pedido-pagado`, envoyé à `PEDIDOS_ALERTA_EMAIL` (`config('payments.pedidos_alerta_email')`) aux
  3 endroits où une commande passe à payée (`KkiapayController::confirmar`, webhook FedaPay,
  `OrderController::show`), dans un try/catch : un échec d'envoi ne bloque jamais le paiement.
  Testé : alerte reçue en boîte de réception (SB-2026-0021), pas en indésirables.
  **Annulation automatique des impayées : abandonnée (19 octobre 2026)**, la boutique ne gère pas
  vraiment de stock. Attention : le code retire quand même le stock à chaque commande et refuse
  une commande si `stock < quantité` (« Stock insuficiente ») ; garder des stocks élevés.
  **Déployé en production le 19 octobre 2026** : gammes, espace « Pedidos », fenêtres de
  confirmation, alertes e-mail (`.env` serveur : MAIL_* + PEDIDOS_ALERTA_EMAIL), pied de page,
  icônes (`favicon-32.png`, `icon-192.png`, `apple-touch-icon.png`). Migration tracking_dates jouée.
- **Classement par gamme (`gama`) — fait en local le 17 octobre 2026, à déployer.** Colonne
  `products.gama` (migration `add_gama_to_products_table`, nullable, indexée), valeurs
  `SANDY NATUR` / `BELLA ECUATOGUINEANA BIO` (validées par `in:` dans `AdminProductController`).
  **Filtre côté API** : `GET /api/products?gama=...` dans `ProductController::index`, avant
  `paginate` (l'ancien filtre dans le navigateur ne voyait que la page affichée). Front :
  liste « Gama » dans `AdminProductForm`, colonne Gama dans `AdminProducts` (« Sin gama »
  signalé), `Tienda.jsx` envoie `gama` à l'API et repart page 1 quand la gamme change.
  Déploiement : 4 fichiers backend + la migration, puis `php artisan migrate --force`, puis
  attribuer une gamme aux 31 produits de prod par le back-office.
- Aligner le reste du catalogue sur la maquette 01 : champs `ingredientes`, `inci`,
  `beneficios`, `piel`, `uso` ; 6 catégories (Facial, Corporal, Aceites, Capilar, Jabones,
  Esencial) au lieu des 5 actuelles, et les 21 produits réels
- Page de détail produit (la maquette 01 affiche l'INCI et le mode d'emploi)
- Table `citas` : la réservation de cabine part aujourd'hui par WhatsApp, rien n'est enregistré
- Réservation de cabine : aujourd'hui un simple lien WhatsApp pré-rempli, pas de table `citas`

- Création de commande côté serveur — **recalculer tous les prix depuis la base**, ne jamais
  faire confiance au panier envoyé par le navigateur
- Tunnel de commande dans React : panier, formulaire client, choix du moyen de paiement
- Back-office pour marquer une commande comme payée
- Images des produits (`image_path` est vide pour l'instant)
