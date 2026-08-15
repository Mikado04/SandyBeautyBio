// Informations de la marque, rassemblees ici pour n'avoir qu'un seul endroit a modifier.

export const MARCA = {
    nombre: 'Bella Ecuatoguineana',
    razonSocial: 'BIOCOSMÉTICA S.L.U.',
    direccion: 'Buena Esperanza 1, R15, Malabo, Guinea Ecuatorial',
    whatsapp: '+240222123456',
    email: 'hola@bellaecuatoguineana.gq',
}

export const GAMAS = [
    {
        clave: 'sandy-natur',
        nombre: 'SANDY NATUR',
        lema: 'Cuidado diario accesible',
        texto:
            'Ingredientes de Bioko. Rutina completa rostro, cuerpo y cabello sin comprometer la selva.',
    },
    {
        clave: 'bella-bio',
        nombre: 'BELLA ECUATOGUINEANA BIO',
        lema: 'Alta biocosmética certificada',
        texto:
            'Activos de alta concentración, aceites raros de Bioko y formulación BIO para resultados visibles.',
    },
]

export const CERTIFICACIONES = [
    'OAPI',
    'ISO 9001',
    'ISO 22716 GMP',
    'ISO 16128 Natural',
]

export const SERVICIOS = [
    {
        clave: 'relajante',
        nombre: 'Relajante Esencial',
        duracion: '60 min',
        precio: 20000,
        texto:
            'Desconexión profunda con aceite de Malamba tibio y maniobras lentas. Ideal estrés e insomnio.',
    },
    {
        clave: 'deportivo',
        nombre: 'Deportivo Recuperación',
        duracion: '75 min',
        precio: 25000,
        texto:
            'Descarga muscular intensa para piernas y espalda. Moringa y mentol natural.',
    },
    {
        clave: 'bella',
        nombre: 'Ritual Bella con Aceites',
        duracion: '90 min',
        precio: 35000,
        texto:
            'Ceremonia completa cuerpo y cuero cabelludo con los 7 aceites BIO. Lujo absoluto.',
    },
]

// Construit un lien WhatsApp avec un message pre-rempli
export function enlaceWhatsApp(mensaje) {
    const numero = MARCA.whatsapp.replace(/[^0-9]/g, '')

    return 'https://wa.me/' + numero + '?text=' + encodeURIComponent(mensaje)
}
