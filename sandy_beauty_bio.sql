-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : ven. 14 août 2026 à 12:58
-- Version du serveur : 12.3.2-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `sandy_beauty_bio`
--

-- --------------------------------------------------------

--
-- Structure de la table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `position` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `position`, `created_at`, `updated_at`) VALUES
(1, 'Rostro', 'rostro', 1, '2026-08-11 13:02:50', '2026-08-11 13:02:50'),
(2, 'Cuerpo', 'cuerpo', 2, '2026-08-11 13:02:50', '2026-08-11 13:02:50'),
(3, 'Higiene', 'higiene', 3, '2026-08-11 13:02:50', '2026-08-11 13:02:50'),
(4, 'Aromas & Bienestar', 'aromas-bienestar', 4, '2026-08-11 13:02:50', '2026-08-11 13:02:50'),
(5, 'Labios', 'labios', 5, '2026-08-11 13:02:50', '2026-08-11 13:02:50');

-- --------------------------------------------------------

--
-- Structure de la table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_08_11_002235_create_personal_access_tokens_table', 1),
(5, '2026_08_11_140439_create_categories_table', 2),
(6, '2026_08_11_140504_create_products_table', 2),
(10, '2026_08_12_152548_create_orders_table', 3),
(11, '2026_08_12_152607_create_order_items_table', 3),
(12, '2026_08_12_152627_create_payments_table', 3);

-- --------------------------------------------------------

--
-- Structure de la table `orders`
--

CREATE TABLE `orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_phone` varchar(255) NOT NULL,
  `customer_email` varchar(255) DEFAULT NULL,
  `customer_city` varchar(255) NOT NULL,
  `customer_address` text NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `payment_method` varchar(255) NOT NULL,
  `payment_status` varchar(255) NOT NULL DEFAULT 'pending',
  `currency` varchar(3) NOT NULL DEFAULT 'XAF',
  `total` int(10) UNSIGNED NOT NULL,
  `notes` text DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `order_items`
--

CREATE TABLE `order_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `size` varchar(255) DEFAULT NULL,
  `unit_price` int(10) UNSIGNED NOT NULL,
  `quantity` smallint(5) UNSIGNED NOT NULL,
  `subtotal` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `payments`
--

CREATE TABLE `payments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `driver` varchar(255) NOT NULL,
  `external_reference` varchar(255) DEFAULT NULL,
  `amount` int(10) UNSIGNED NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `currency` varchar(3) NOT NULL DEFAULT 'XAF',
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`payload`)),
  `confirmed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(7, 'App\\Models\\User', 5, 'admin', '989d5e972b28df79e7244121764b4cd328fbb6c24f5d8e15707c12c5db193367', '[\"*\"]', '2026-08-13 21:31:23', NULL, '2026-08-13 21:31:20', '2026-08-13 21:31:23'),
(10, 'App\\Models\\User', 2, 'admin', '49e6c6c984802452b0dbe66448011a500f00589754f8c2676b5450792b302659', '[\"*\"]', '2026-08-14 08:08:52', NULL, '2026-08-13 21:49:46', '2026-08-14 08:08:52');

-- --------------------------------------------------------

--
-- Structure de la table `products`
--

CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `size` varchar(255) DEFAULT NULL,
  `price` int(10) UNSIGNED NOT NULL,
  `stock` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `highlight` varchar(255) DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `products`
--

INSERT INTO `products` (`id`, `category_id`, `name`, `slug`, `description`, `size`, `price`, `stock`, `highlight`, `image_path`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 2, 'Gel de Ducha', 'gel-de-ducha', 'Limpieza suave con aloe y tola', '500ml', 7500, 24, NULL, NULL, 1, '2026-08-11 13:02:50', '2026-08-11 13:02:50'),
(2, 1, 'Gel Facial', 'gel-facial', 'Purifica sin resecar', '150ml', 8000, 18, 'Best-seller', NULL, 1, '2026-08-11 13:02:50', '2026-08-11 13:02:50'),
(3, 3, 'Gel Íntimo', 'gel-intimo', 'pH equilibrado, moringa', '200ml', 6500, 32, NULL, NULL, 1, '2026-08-11 13:02:50', '2026-08-11 13:02:50'),
(4, 3, 'Gel de Manos', 'gel-de-manos', 'Antibacteriano hidratante', '250ml', 4500, 40, NULL, NULL, 1, '2026-08-11 13:02:50', '2026-08-11 13:02:50'),
(5, 1, 'Crema Facial', 'crema-facial', 'Nutrición intensa día/noche', '50ml', 12000, 12, 'Nuevo', NULL, 1, '2026-08-11 13:02:50', '2026-08-13 13:39:23'),
(6, 2, 'Crema Corporal', 'crema-corporal', 'Karité de Bioko', '250ml', 10000, 20, NULL, NULL, 1, '2026-08-11 13:02:50', '2026-08-14 08:46:58'),
(7, 2, 'Crema Manos', 'crema-manos', 'Reparadora', '75ml', 5000, 28, NULL, NULL, 1, '2026-08-11 13:02:50', '2026-08-11 13:02:50'),
(8, 2, 'Exfoliante Corporal', 'exfoliante-corporal', 'Tola y azúcar', '200g', 9000, 15, NULL, NULL, 1, '2026-08-11 13:02:50', '2026-08-11 13:02:50'),
(9, 1, 'Serum Facial', 'serum-facial', 'Ácido hialurónico vegetal', '30ml', 15000, 10, 'Alta concentración', NULL, 1, '2026-08-11 13:02:50', '2026-08-13 13:39:23'),
(10, 2, 'Serum Corporal', 'serum-corporal', 'Aceites Esenciales Iluminador', '100ml', 14000, 14, NULL, NULL, 1, '2026-08-11 13:02:50', '2026-08-11 13:02:50'),
(11, 4, 'Fragancia / Perfume', 'fragancia-perfume', 'Esencia de Bioko - Extractos Aromáticos', '50ml', 18000, 8, 'Edición Bioko', NULL, 1, '2026-08-11 13:02:50', '2026-08-11 13:02:50'),
(12, 3, 'Jabón Corporal', 'jabon-corporal', 'Artesanal cold-pressed', '150g', 3500, 50, NULL, NULL, 1, '2026-08-11 13:02:50', '2026-08-11 13:02:50'),
(15, 4, 'Vela Aromática', 'vela-aromatica', 'Vidrio transparente - Soja y esencias', '180g', 8500, 19, NULL, NULL, 1, '2026-08-11 13:02:50', '2026-08-11 13:02:50'),
(16, 4, 'Especias en Polvo', 'especias-en-polvo', 'Ritual baño purificante', '80g', 4000, 30, NULL, NULL, 1, '2026-08-11 13:02:50', '2026-08-14 08:46:58'),
(17, 4, 'Sal de Baño', 'sal-de-bano', 'Himalaya rosa + anís de Bioko', '300g', 6000, 26, NULL, NULL, 1, '2026-08-11 13:02:50', '2026-08-11 13:02:50'),
(19, 5, 'Labial Protectivo', 'labial-protectivo', 'Karité y cacao ecuatoguineano', '5g', 3000, 45, NULL, NULL, 1, '2026-08-11 13:02:50', '2026-08-11 13:02:50'),
(20, 1, 'Bruma Facial', 'bruma-facial', 'Refrescante tola', '100ml', 6000, 25, NULL, NULL, 1, '2026-08-11 13:02:50', '2026-08-11 13:02:50'),
(22, 4, 'Aceite de Masajes', 'aceite-de-masajes', 'Relajante ylang-ylang', '200ml', 11000, 16, NULL, NULL, 1, '2026-08-14 08:46:58', '2026-08-14 08:46:58'),
(23, 1, 'Agua Micelar', 'agua-micelar', 'Desmaquillante natural', '250ml', 7000, 22, NULL, NULL, 1, '2026-08-14 08:46:58', '2026-08-14 08:46:58'),
(24, 4, 'Bombas de Baño', 'bombas-de-bano', 'Efervescentes naturales', '3x90g', 7500, 21, NULL, NULL, 1, '2026-08-14 08:46:58', '2026-08-14 08:46:58');

-- --------------------------------------------------------

--
-- Structure de la table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('3zYBfOS2lhDSHXFJ40V6hUHrtiRjmxw6VRO6eFON', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiNXJ3c2EyTkplNk45R2tTanBWMWZmczZCdmlFMTVVU3VVeFRyd0QyWiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1786666367),
('ANKeqC9VHpF8pkSQrEQIzAmlL05qCvKfD0YRLBw3', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZHRWSEdWbDgyZWlURG5UdmpxWnpEVlVlMnhrenc0c1hhVG1aUDZhYiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzY6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9hcGkvY2F0ZWdvcmllcyI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1786637355),
('BD3wpTIRRMIASfoyHdKPVdJlMIrB6udVogmkvNp9', NULL, '127.0.0.1', 'curl/8.15.0', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiVVFad3lOTEVIWmg5ZzhzWXIzcFpCd09EUGhGcXllUFczMlBHUmFXdiI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1786640575),
('EqBuuVW2QJif4YdxWlmrpQoAA99dys8LReh7Fr5g', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoicTZ0YjJCZ0c0R2QzZjJ1WHZpZDJxUGo5ek1raWZseWM0TTYxeHdOQSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9hcGkvcHJvZHVjdHM/cGFnZT0xIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1786639460),
('nmtIgI06B3HyjloYR1fpX3BqmSu9eGqYbhDpTdzJ', NULL, '127.0.0.1', 'PostmanRuntime/7.56.0', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiNHM2S0VMVTdCMGpscmpZa2lGVHZwZHFlRkJFQWJJSGVGcEtxQmpJMSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1786640974),
('VNQvpxgW8lVunrzVkht3ptd69I9diKmhDOF1J4qf', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoieUV4cGdQYUU1NjlLeEFjc0lIeDNsQURjeEhCa0xJRzlGMTVQT1JHWCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9hcGkvcHJvZHVjdHM/cGFnZT0xIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1786637355),
('zHU8DPfR3SZSCtBYYZYgQJrV9AanYVhdlbklnHi2', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiVFlpVzVla0dwRXRadjNERVRxcm1Kd2pBdHBYQUNoT2pwRmRTRGNSTiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9hcGkvcHJvZHVjdHM/cGFnZT0xIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1786637355),
('ZR3T5b7y2ISiyTDjCOUJy8cZiLXgjmy0836GUKrv', NULL, '127.0.0.1', 'curl/8.15.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiUzNUWVU2RDl2NTdlQnp1MG11eks2RW5MTm1IR3JQVjNIenpnbEdhciI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9zYW5jdHVtL2NzcmYtY29va2llIjtzOjU6InJvdXRlIjtzOjE5OiJzYW5jdHVtLmNzcmYtY29va2llIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1786640600),
('ztwPPPeXAqQjAzL6B6thZuZ6d6qT0GEPnYr03DWO', 3, '127.0.0.1', 'curl/8.15.0', 'YTo1OntzOjY6Il90b2tlbiI7czo0MDoiZkg5YXZDTUdaMkhaS2NhSUxaS2NiYWtXdE1Oc2FiM2dMNm9Eb3dRSyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mjg6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9hcGkvbWUiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fXM6NTA6ImxvZ2luX3dlYl81OWJhMzZhZGRjMmIyZjk0MDE1ODBmMDE0YzdmNThlYTRlMzA5ODlkIjtpOjM7czoxNzoicGFzc3dvcmRfaGFzaF93ZWIiO3M6NjQ6IjIwNGY1M2Q5YjRkNTMxMjRhNjQxOGZmMmJkOGZjMGMwZWRiZjJiZTdmNTU1YWZjMDgzNjVlYmI0ZDg1YjJmODEiO30=', 1786640624);

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
(2, 'Admin Sandy', 'admin@sandybeautybio.com', NULL, '$2y$12$jqFke6X1edZ6IuI2aTetyODZVcTqEqfO5U.8YzKEyxCIdf.iPANJe', NULL, '2026-08-13 14:59:50', '2026-08-13 14:59:50');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Index pour la table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Index pour la table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `categories_slug_unique` (`slug`);

--
-- Index pour la table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Index pour la table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Index pour la table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orders_status_created_at_index` (`status`,`created_at`);

--
-- Index pour la table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_items_order_id_foreign` (`order_id`),
  ADD KEY `order_items_product_id_foreign` (`product_id`);

--
-- Index pour la table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Index pour la table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payments_order_id_foreign` (`order_id`);

--
-- Index pour la table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Index pour la table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `products_slug_unique` (`slug`),
  ADD KEY `products_category_id_is_active_index` (`category_id`,`is_active`);

--
-- Index pour la table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT pour la table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT pour la table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT pour la table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
