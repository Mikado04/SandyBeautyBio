// Toutes les informations de la marque, relevees sur la maquette Sandy Beauty 01.
// Un seul endroit a modifier si quelque chose change.

export const MARCA = {
    nombre: 'Sandy Beauty',
    razonSocial: 'Sandy Beauty Biocosmética S.L.U.',
    direccion: 'Buena Esperanza 1, R15, Malabo, Guinea Ecuatorial',
    horario: 'Lunes a Sábado 9:00-19:00',
    telefono1: '+240 555 500 287',
    telefono2: '+240 555 971 269',
    // Boite creee sur o2switch. L'ancienne adresse de la maquette (gerencia@sandybeautyeg.com)
    // n'existait pas : le domaine sandybeautyeg.com n'a pas de serveur de messagerie.
    email: 'contabilidad@sandybeautybio.com',
    instagram: '@sandybeauty_belleza',
    whatsapp: '+240555500287',
    fundadora: 'Sandra Eyang Neogo Belobe',
    fundadoraRol: 'Fundadora · Bióloga · Herbolaria Bioko',
}

export const CERTIFICACIONES = [
    'OAPI Marca Registrada',
    'ISO 9001',
    'ISO 16128 Natural',
    'ISO 22716 GMP',
    '100% Guinea Ecuatorial',
]

export const GAMAS = [
    {
        clave: 'SANDY NATUR',
        etiqueta: '15 fórmulas',
        titulo: 'SANDY NATUR',
        texto:
            'Cuidado diario accesible, ingredientes de Bioko. Rutina completa rostro, cuerpo y cabello sin comprometer la selva.',
        puntos: [
            'Desde 2.500 XAF · Zero waste',
            '95-99% ingredientes naturales',
            'Producción local trazable',
        ],
        boton: 'Ver Sandy Natur',
    },
    {
        clave: 'BELLA ECUATOGUINEANA BIO',
        etiqueta: '6 líneas BIO · Premium',
        titulo: 'BELLA ECUATOGUINEANA',
        texto:
            'Línea 100% BIO certificada, alta concentración. Cacao blanco, Okume sagrado y 7 aceites. Resultados visibles.',
        puntos: [
            '100% ingredientes BIO certificados',
            'Activos biotecnológicos vegetales',
            'Ritual de alta perfumería natural',
        ],
        boton: 'Descubrir Bella BIO',
    },
]

export const SERVICIOS = [
    {
        clave: 'relajante',
        nombre: 'Relajante Esencial',
        duracion: '60min',
        precio: 20000,
        texto:
            'Desconexión profunda con aceite de Malamba tibio y maniobras lentas. Ideal estrés e insomnio.',
        incluye: ['Aceite Malamba tibio', 'Aromaterapia vainilla', 'Infusión Moringa'],
    },
    {
        clave: 'deportivo',
        nombre: 'Deportivo Recuperación',
        duracion: '75min',
        precio: 25000,
        texto: 'Descarga muscular intensa para piernas y espalda. Moringa + mentol natural.',
        incluye: ['Técnica profunda', 'Ventosas opcionales', 'Estiramientos asistidos'],
    },
    {
        clave: 'bella',
        nombre: 'Ritual Bella con Aceites',
        duracion: '90min',
        precio: 35000,
        texto:
            'Ceremonia completa cuerpo y cuero cabelludo con los 7 aceites BIO. Lujo absoluto.',
        incluye: ['Elixir 7 Aceites BIO', 'Masaje craneal', 'Sahumerio suave cacao'],
    },
]

export const VALORES = [
    { titulo: 'Calidad', texto: 'ISO 9001 + 22716. Trazabilidad lote a hoja.' },
    { titulo: 'Sostenibilidad', texto: 'Agroforestería, 0% palma, recolección manual.' },
    { titulo: 'Local', texto: '100% fabricado en Malabo. Empleo digno mujeres.' },
]

export const TIMELINE = [
    { anio: '2018', texto: 'Finca piloto 0.5ha Moringa y Coco' },
    { anio: '2020', texto: 'Primer obrador certificado ISO 22716 en Malabo' },
    { anio: '2022', texto: 'Registro OAPI + 15 fórmulas Sandy Natur' },
    { anio: '2024', texto: 'Lanzamiento Bella BIO - 100% BIO + Masajes Ritual' },
]

// Construit un lien WhatsApp avec un message pre-rempli
export function enlaceWhatsApp(mensaje) {
    const numero = MARCA.whatsapp.replace(/[^0-9]/g, '')

    return 'https://wa.me/' + numero + '?text=' + encodeURIComponent(mensaje)
}

// Lien d'appel : 'tel:+240555500287' (les espaces genent certains telephones)
export function enlaceTelefono(numero) {
    return 'tel:' + numero.replace(/[^0-9+]/g, '')
}

// Lien qui ouvre la messagerie de la personne, adresse deja remplie
export function enlaceEmail(adresse) {
    return 'mailto:' + adresse
}

// '@sandybeauty_belleza' -> 'https://www.instagram.com/sandybeauty_belleza/'
export function enlaceInstagram(compte) {
    return 'https://www.instagram.com/' + compte.replace('@', '') + '/'
}
