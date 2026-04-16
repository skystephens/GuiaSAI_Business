/**
 * Script para exportar tarifas desde Airtable a JSON estático
 *
 * USO:
 * 1. Configurar variables de entorno en .env.local:
 *    VITE_AIRTABLE_API_KEY=xxx
 *    VITE_AIRTABLE_BASE_ID=xxx
 *
 * 2. Ejecutar:
 *    node scripts/export-tariffs.js
 *
 * 3. El archivo public/data/tarifas.json se actualizará
 */

import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Obtener directorio actual (ESM compatible)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__filename, '../..')

// Leer variables de entorno
const AIRTABLE_API_KEY = process.env.VITE_AIRTABLE_API_KEY || ''
const AIRTABLE_BASE_ID = process.env.VITE_AIRTABLE_BASE_ID || ''
const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error('❌ Error: Falta configurar VITE_AIRTABLE_API_KEY o VITE_AIRTABLE_BASE_ID')
  console.error('   Crea un archivo .env.local con:')
  console.error('   VITE_AIRTABLE_API_KEY=tu_api_key')
  console.error('   VITE_AIRTABLE_BASE_ID=tu_base_id')
  process.exit(1)
}

const getHeaders = () => ({
  Authorization: `Bearer ${AIRTABLE_API_KEY}`,
  'Content-Type': 'application/json',
})

// Normaliza valores a array de strings
function normalizeToArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === 'string') return [value].filter(Boolean)
  return []
}

// Parsea horarios desde Dias_Operacion o Horarios
function parseHorarios(diasOperacion) {
  if (!diasOperacion || typeof diasOperacion !== 'string') return []

  try {
    // Formato 12h (XX:XX AM/PM)
    const horariosMatch12 = diasOperacion.match(/\d{1,2}:\d{2}\s*(AM|PM|am|pm)/gi)
    if (horariosMatch12 && horariosMatch12.length > 0) {
      const convertidos = horariosMatch12.map(h => {
        const parts = h.match(/(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)/i)
        if (parts) {
          let hours = parseInt(parts[1])
          const mins = parts[2]
          const meridiem = parts[3].toUpperCase()
          if (meridiem === 'PM' && hours !== 12) hours += 12
          if (meridiem === 'AM' && hours === 12) hours = 0
          return `${String(hours).padStart(2, '0')}:${mins}`
        }
        return null
      }).filter(Boolean)
      if (convertidos.length > 0) {
        return [...new Set(convertidos)].sort()
      }
    }

    // Formato 24h (HH:MM)
    const horariosMatch = diasOperacion.match(/\d{1,2}:\d{2}/g)
    if (horariosMatch && horariosMatch.length > 0) {
      const normalizados = horariosMatch.map(h => {
        const [hh, mm] = h.split(':')
        return `${hh.padStart(2, '0')}:${mm}`
      })
      return [...new Set(normalizados)].sort()
    }

    return []
  } catch (error) {
    console.warn('Error parseando horarios:', error)
    return []
  }
}

// Slugify para URLs
function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

async function fetchAllRecords(tableName, filterByFormula = '') {
  const allRecords = []
  let offset = null

  do {
    const url = `${AIRTABLE_API_URL}/${encodeURIComponent(tableName)}`
    const params = { maxRecords: 100 }
    if (filterByFormula) params.filterByFormula = filterByFormula
    if (offset) params.offset = offset

    const response = await axios.get(url, { headers: getHeaders(), params })
    allRecords.push(...response.data.records)
    offset = response.data.offset
  } while (offset)

  return allRecords
}

async function exportAccommodations() {
  console.log('🏨 Exportando alojamientos...')

  const records = await fetchAllRecords(
    'ServiciosTuristicos_SAI',
    `AND({Tipo de Servicio} = 'Alojamiento', {Publicado} = 1)`
  )

  return records.map(record => ({
    id: record.id,
    nombre: record.fields.Servicio || record.fields.Nombre || 'Sin nombre',
    descripcion: record.fields.Descripcion || '',
    categoria: record.fields.Categoria || record.fields['Tipo de Alojamiento'] || 'Alojamiento',
    publicado: true,
    accommodationType: record.fields['Tipo de Alojamiento'] || 'Hotel',
    precioActualizado: parseFloat(record.fields.Precio || record.fields['Precio actualizado'] || 0),
    precio1Huesped: parseFloat(record.fields['Precio 1 Huesped'] || record.fields.Precio || 0),
    precio2Huespedes: parseFloat(record.fields['Precio 2 Huespedes'] || record.fields.Precio || 0),
    precio3Huespedes: parseFloat(record.fields['Precio 3 Huespedes'] || record.fields.Precio || 0),
    precio4Huespedes: parseFloat(record.fields['Precio 4+ Huespedes'] || record.fields.Precio || 0),
    precioBase: parseFloat(record.fields.Precio || record.fields.PrecioBase || 0),
    precioMin: parseFloat(record.fields.PrecioMin || record.fields.Precio || 0),
    precioMax: parseFloat(record.fields.PrecioMax || record.fields.Precio || 0),
    capacidad: parseInt(record.fields['Capacidad Maxima'] || record.fields.Capacidad || 0),
    ubicacion: record.fields.Ubicacion || '',
    telefono: record.fields['Telefono Contacto'] || record.fields.Telefono || '',
    email: record.fields['Email Contacto'] || record.fields.Email || '',
    imageUrl: record.fields.Imagenurl?.[0]?.url || record.fields.ImagenURL?.[0]?.url ||
              record.fields.Imagenurl?.[0] || record.fields.ImagenURL?.[0] || '',
    images: (record.fields.Imagenurl || record.fields.ImagenURL || []).map(img =>
      typeof img === 'string' ? img : img?.url || ''
    ).filter(url => url),
    estrellas: parseInt(record.fields.Rating || record.fields.Estrellas || 0),
    amenities: record.fields.Amenities || [],
    servicios: record.fields.Servicios || record.fields.Amenities || [],
    horarioCheckIn: record.fields.HorarioCheckIn || '14:00',
    horarioCheckOut: record.fields.HorarioCheckOut || '11:00',
    destacado: record.fields.Destacado === true,
    slug: record.fields.Slug || record.fields.slug || slugify(record.fields.Servicio || record.fields.Nombre || ''),
    categoriaServicio: normalizeToArray(record.fields.Categoria),
  }))
}

async function exportTours() {
  console.log('🎫 Exportando tours...')

  const records = await fetchAllRecords(
    'ServiciosTuristicos_SAI',
    `AND({Tipo de Servicio} = 'Tour', {Publicado} = 1)`
  )

  return records.map(record => {
    const getHorarioValue = () => {
      const priorityFields = [
        'Horarios_Operacion', 'Horarios de Operacion', 'Horario de Operacion',
        'Horarios de Operación', 'Horario de Operación', 'HorariosOperacion',
        'Horario', 'Horarios', 'Horario Salida', 'Hora Salida', 'Hora'
      ]
      for (const field of priorityFields) {
        const val = record.fields[field]
        if (val !== undefined && val !== null && val !== '') {
          return Array.isArray(val) ? val.join(', ') : String(val)
        }
      }
      return ''
    }

    const getDiasValue = () => {
      const fields = ['Dias_Operacion', 'DiasOperacion', 'Días de Operación', 'Dias de Operacion', 'Days of Operation']
      for (const field of fields) {
        const val = record.fields[field]
        if (val !== undefined && val !== null && val !== '') {
          return Array.isArray(val) ? val.join(', ') : String(val)
        }
      }
      return ''
    }

    const horariosCampo = getHorarioValue()
    const diasCampo = getDiasValue()
    const horariosExtraidos = parseHorarios(horariosCampo)

    return {
      id: record.id,
      nombre: record.fields.Servicio || record.fields.Nombre || 'Sin nombre',
      descripcion: record.fields.Descripcion || record.fields.Itinerario || '',
      categoria: record.fields['Tipo de Servicio'] || record.fields.Categoria || 'Tour',
      publicado: true,
      precioBase: parseFloat(record.fields['Precio actualizado'] || record.fields.Precio || record.fields.PrecioBase || 0),
      precioPerPerson: parseFloat(record.fields['Precio actualizado'] || record.fields.Precio || record.fields.PrecioPerPerson || 0),
      duracion: record.fields.Duracion || '4 horas',
      capacidad: parseInt(record.fields.Capacidad || 10),
      ubicacion: record.fields.Ubicacion || '',
      telefono: record.fields['Telefono Contacto'] || record.fields.Telefono || '',
      email: record.fields['Email Contacto'] || record.fields.Email || '',
      imageUrl: record.fields.Imagenurl?.[0]?.url || record.fields.ImagenURL?.[0]?.url ||
                record.fields.Imagenurl?.[0] || record.fields.ImagenURL?.[0] || '',
      images: (record.fields.Imagenurl || record.fields.ImagenURL || []).map(img =>
        typeof img === 'string' ? img : img?.url || ''
      ).filter(url => url),
      diasOperacion: diasCampo || horariosCampo,
      horarios: horariosExtraidos,
      horariosDisponibles: horariosExtraidos,
      horarioInicio: record.fields.HorarioInicio || record.fields['Horario Inicio'] || '08:00',
      horarioFin: record.fields.HorarioFin || record.fields['Horario Fin'] || '16:00',
      incluye: normalizeToArray(record.fields.Incluye || record.fields['que Incluye']),
      noIncluye: normalizeToArray(record.fields.NoIncluye),
      dificultad: record.fields.Dificultad || 'Fácil',
      destacado: record.fields.Destacado === true,
      slug: record.fields.Slug || record.fields.slug || slugify(record.fields.Servicio || record.fields.Nombre || ''),
      categoriaServicio: normalizeToArray(record.fields.Categoria),
      operador: record.fields['Nombre Operador Aliado'] || record.fields.Operador || '',
      puntoEncuentro: record.fields['Punto de encuentro'] || record.fields.PuntoEncuentro || '',
      itinerario: record.fields.Itinerario || '',
      politicasCancelacion: record.fields['Politicas de cancelacion'] || record.fields.PoliticasCancelacion || '',
    }
  })
}

async function exportTransports() {
  console.log('🚕 Exportando transportes...')

  const records = await fetchAllRecords(
    'ServiciosTuristicos_SAI',
    `AND({Categoria} = 'Transporte', {Publicado} = 1)`
  )

  return records.map(record => ({
    id: record.id,
    nombre: record.fields.Nombre || 'Sin nombre',
    descripcion: record.fields.Descripcion || '',
    categoria: record.fields.Categoria || 'Transporte',
    publicado: true,
    precioPerVehicle: parseFloat(record.fields.PrecioPerVehicle || record.fields.PrecioBase || 0),
    capacidad: parseInt(record.fields.Capacidad || 5),
    tipo: record.fields.Tipo || 'Automóvil',
    telefono: record.fields.Telefono || '',
    email: record.fields.Email || '',
    operador: record.fields.Operador || '',
    rutas: record.fields.Rutas || ['Aeropuerto-Hotel', 'Hotel-Hotel'],
  }))
}

// Función principal
async function main() {
  console.log('🚀 Iniciando exportación de tarifas desde Airtable...\n')

  try {
    const [accommodations, tours, transports] = await Promise.all([
      exportAccommodations(),
      exportTours(),
      exportTransports()
    ])

    const tarifasData = {
      version: `1.0.${Date.now()}`,
      lastUpdated: new Date().toISOString(),
      accommodations,
      tours,
      transports
    }

    // Guardar en public/data/tarifas.json
    const outputPath = path.join(ROOT_DIR, 'public', 'data', 'tarifas.json')
    const outputDir = path.dirname(outputPath)

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    fs.writeFileSync(
      outputPath,
      JSON.stringify(tarifasData, null, 2),
      'utf8'
    )

    console.log('\n✅ Exportación completada!')
    console.log(`📁 Archivo guardado en: ${outputPath}`)
    console.log(`\n📊 Resumen:`)
    console.log(`   - Alojamientos: ${accommodations.length}`)
    console.log(`   - Tours: ${tours.length}`)
    console.log(`   - Transportes: ${transports.length}`)
    console.log(`\n🔄 Versión: ${tarifasData.version}`)
    console.log(`📅 Última actualización: ${tarifasData.lastUpdated}`)

  } catch (error) {
    console.error('\n❌ Error durante la exportación:', error.message)
    if (error.response) {
      console.error('   Status:', error.response.status)
      console.error('   Data:', JSON.stringify(error.response.data, null, 2))
    }
    process.exit(1)
  }
}

// Ejecutar
main()
