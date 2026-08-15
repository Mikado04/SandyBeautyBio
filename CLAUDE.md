# Sandy Beauty Bio

Boutique en ligne de biocosmétique fabriquée à Malabo, **Guinée Équatoriale**.
Interface en **espagnol**. Monnaie : **franc CFA (XAF)**.

## Identité visuelle — maquette `Sandy Beauty 01.html`

C'est **la 01** qui fait référence pour le front (la 02 a servi au premier jet du catalogue).

- Marque : **Bella Ecuatoguineana** — raison sociale `BIOCOSMÉTICA S.L.U.`,
  Buena Esperanza 1 R15, Malabo
- Deux gammes : **SANDY NATUR** (quotidien accessible) et **BELLA ECUATOGUINEANA BIO** (premium)
- Couleurs : `#1B4332` vert forêt · `#F5F1EB` crème · `#C9A86A` or · `#E8C88A` or clair
- Typographies : **Bodoni Moda** (titres) + **Inter** (texte)
- Certifications affichées : OAPI, ISO 9001, ISO 22716 GMP, ISO 16128 Natural
- Ces valeurs sont déclarées une seule fois dans `frontend/src/index.css` (bloc `@theme`)
  et `frontend/src/lib/marca.js`

## Pile technique

| Élément | Détail |
| --- | --- |
| Backend | Laravel 12.65 — PHP 8.2.12 — dossier `backend/` |
| Frontend | React 19.2 + Vite 8.2 + Tailwind CSS v4 — dossier `frontend/` |
| Base de données | MariaDB 12.3.2 — base `sandy_beauty_bio` |
| Authentification | Laravel Sanctum, mode SPA par cookie de session |
| Maquette d'origine | `Sandy Beauty 02.html` — référence visuelle et source du catalogue |

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
2. **FedaPay** — prévu pour une future filiale au **Bénin**, en **XOF**. SDK
   `fedapay/fedapay-php` déjà installé. Désactivé par défaut (`PAY_FEDAPAY_ENABLED=false`).

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

**À faire**

- Aligner le catalogue sur la maquette 01 : champs `gama`, `ingredientes`, `inci`,
  `beneficios`, `piel`, `uso` ; 6 catégories (Facial, Corporal, Aceites, Capilar, Jabones,
  Esencial) et les 21 produits réels
- Page de détail produit (la maquette 01 affiche l'INCI et le mode d'emploi)
- Réservation de cabine : aujourd'hui un simple lien WhatsApp pré-rempli, pas de table `citas`

- Création de commande côté serveur — **recalculer tous les prix depuis la base**, ne jamais
  faire confiance au panier envoyé par le navigateur
- Tunnel de commande dans React : panier, formulaire client, choix du moyen de paiement
- Back-office pour marquer une commande comme payée
- Images des produits (`image_path` est vide pour l'instant)
