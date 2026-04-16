/**
 * refresh-servicios.js
 *
 * Descarga TODOS los registros de ServiciosTuristicos_SAI desde Airtable
 * y actualiza src/data/servicios.json con URLs de imágenes frescas.
 *
 * Las URLs firmadas de Airtable duran ~2 semanas.
 * Ejecuta este script para renovarlas cuando las imágenes se rompan.
 *
 * USO:
 *   node scripts/refresh-servicios.js
 *
 * REQUIERE (en .env.local):
 *   AIRTABLE_API_KEY=patXXXX...
 *   VITE_AIRTABLE_BASE_ID=appXXXX...
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import https from 'https'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, '..')

// ── Leer .env.local manualmente (sin dependencias externas) ─────────────────
function loadEnvLocal() {
  const envPath = path.join(ROOT_DIR, '.env.local')
  if (!fs.existsSync(envPath)) {
    console.error('❌ No se encontró .env.local en:', envPath)
    process.exit(1)
  }
  const lines = fs.readFileSync(envPath, 'utf8').split('\n')
  const env = {}
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim()
    env[key] = val
  }
  return env
}

const env = loadEnvLocal()
const AIRTABLE_API_KEY = env['AIRTABLE_API_KEY'] || ''
const AIRTABLE_BASE_ID = env['VITE_AIRTABLE_BASE_ID'] || ''

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error('❌ Faltan variables en .env.local:')
  console.error('   AIRTABLE_API_KEY =', AIRTABLE_API_KEY ? '✓' : 'FALTA')
  console.error('   VITE_AIRTABLE_BASE_ID =', AIRTABLE_BASE_ID ? '✓' : 'FALTA')
  process.exit(1)
}

// ── Petición HTTP simple sin dependencias externas ──────────────────────────
function httpGet(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
    https.get(url, options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data))
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`))
        }
      })
    }).on('error', reject)
  })
}

// ── Descarga paginada de todos los registros ─────────────────────────────────
async function fetchAllRecords(tableName) {
  const records = []
  let offset = null
  let page = 1

  do {
    let url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}?pageSize=100`
    if (offset) url += `&offset=${encodeURIComponent(offset)}`

    console.log(`   Página ${page}...`)
    const data = await httpGet(url)
    records.push(...(data.records || []))
    offset = data.offset || null
    page++

    // Esperar 250ms entre páginas para no saturar la API (rate limit: 5 req/s)
    if (offset) await new Promise(r => setTimeout(r, 250))
  } while (offset)

  return records
}

// ── Convierte el array de attachments de la API al formato string de localDataService ──
// localDataService.ts espera: "archivo.jpg (https://...),archivo2.jpg (https://...)"
function formatImagenurl(attachments) {
  if (!attachments || !Array.isArray(attachments)) return ''
  return attachments
    .filter(att => att && att.url)
    .map(att => `${att.filename || 'imagen'} (${att.url})`)
    .join(',')
}

// ── Convierte un registro de la API al formato que lee localDataService.ts ──
function convertRecord(record) {
  const f = record.fields

  // Procesar imágenes: la API retorna array de objetos, localDataService espera string
  const imagenurl = formatImagenurl(f['Imagenurl'] || f['ImagenURL'] || f['Fotos'] || f['Attachments'])

  return {
    // Campos de identificación
    'ID': f['ID'] ?? record.id,
    'Servicio': f['Servicio'] || f['Nombre'] || '',
    'Slug': f['Slug'] || f['slug'] || '',
    'Nombre alternativo': f['Nombre alternativo'] || '',

    // Publicación y tipo
    'Publicado': f['Publicado'] === true ? 'checked' : (f['Publicado'] || ''),
    'Destacado': f['Destacado'] === true ? 'checked' : (f['Destacado'] || ''),
    'Tipo de Servicio': f['Tipo de Servicio'] || '',
    'Tipo de Alojamiento': f['Tipo de Alojamiento'] || '',
    'Categoria': f['Categoria'] || '',
    'Tipo de Cliente': f['Tipo de Cliente'] || '',

    // Precios
    'Precio actualizado': f['Precio actualizado'] || f['Precio'] || '',
    'Precio Costo': f['Precio Costo'] || '',
    'Utilidad': f['Utilidad'] || '',
    'Precio_GuanaGO': f['Precio_GuanaGO'] || '',
    'Precio act': f['Precio act'] || '',
    'Precio 1 Huesped': f['Precio 1 Huesped'] || '',
    'Precio 2 Huespedes': f['Precio 2 Huespedes'] || '',
    'Precio 3 Huespedes': f['Precio 3 Huespedes'] || '',
    'Precio 4+ Huespedes': f['Precio 4+ Huespedes'] || '',
    'Plan de Alimentacion': f['Plan de Alimentacion'] || '',
    'TRM DOLLAR': f['TRM DOLLAR'] || '',
    'Minimo Noches': f['Minimo Noches'] || '',

    // Capacidad y logística
    'Capacidad': f['Capacidad'] || '',
    'Capacidad Maxima': f['Capacidad Maxima'] || '',
    'Duracion': f['Duracion'] || '',
    'Ubicacion': f['Ubicacion'] || '',
    'Numero': f['Numero'] || '',
    'Lat_Lon': f['Lat_Lon'] || '',
    'Operación': f['Operación'] || f['Operacion'] || '',
    'Nombre Operador Aliado': f['Nombre Operador Aliado'] || '',

    // Contacto
    'Telefono Contacto': f['Telefono Contacto'] || f['Telefono'] || '',
    'Email contacto': f['Email contacto'] || f['Email Contacto'] || f['Email'] || '',

    // Contenido
    'Descripcion': f['Descripcion'] || '',
    'Itinerario': f['Itinerario'] || '',
    'que Incluye': f['que Incluye'] || f['Incluye'] || '',
    'Politicas de cancelacion': f['Politicas de cancelacion'] || '',
    'Punto de encuentro': f['Punto de encuentro'] || '',
    'Punto de encuentro - Lugar de recogida "Pickup at hotel': f['Punto de encuentro - Lugar de recogida "Pickup at hotel'] || '',

    // Horarios y operación
    'Dias_Operacion': f['Dias_Operacion'] || '',
    'Horarios': f['Horarios'] || f['Horarios_Operacion'] || f['Horarios de Operacion'] || '',

    // Imágenes — con URLs frescas de la API
    'Imagenurl': imagenurl,
    // URLs permanentes de WordPress (nunca expiran). Prioridad sobre Imagenurl.
    'ImagenWP': typeof f['ImagenWP'] === 'string' ? f['ImagenWP'].trim() : '',
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Descargando servicios desde Airtable...')
  console.log(`   Base ID: ${AIRTABLE_BASE_ID}`)
  console.log(`   Token: ${AIRTABLE_API_KEY.slice(0, 15)}...`)
  console.log('')

  try {
    console.log('📋 Descargando ServiciosTuristicos_SAI...')
    const rawRecords = await fetchAllRecords('ServiciosTuristicos_SAI')
    console.log(`   ✓ ${rawRecords.length} registros obtenidos`)

    // Convertir al formato que espera localDataService.ts
    const servicios = rawRecords.map(convertRecord)

    // Estadísticas
    const tipos = {}
    const publicados = servicios.filter(s => s['Publicado'] === 'checked').length
    servicios.forEach(s => {
      const t = s['Tipo de Servicio'] || '(sin tipo)'
      tipos[t] = (tipos[t] || 0) + 1
    })

    console.log('\n📊 Resumen:')
    console.log(`   Total: ${servicios.length} registros`)
    console.log(`   Publicados: ${publicados}`)
    Object.entries(tipos).forEach(([tipo, count]) => {
      console.log(`   ${tipo}: ${count}`)
    })

    // Guardar en src/data/servicios.json
    const outputPath = path.join(ROOT_DIR, 'src', 'data', 'servicios.json')
    fs.writeFileSync(outputPath, JSON.stringify(servicios, null, 2), 'utf8')
    console.log(`\n✅ servicios.json actualizado: ${outputPath}`)

    // ── Generar public/image-overrides.json ──────────────────────────────────
    // Prioridad: ImagenWP (URLs permanentes de WordPress) > Imagenurl (Airtable, expiran)
    // serviceOverrides.ts carga este archivo en runtime (fetch), por lo que
    // todos los visitantes reciben las URLs actualizadas sin necesidad de rebuild.
    const imageOverrides = {}
    let wpCount = 0
    let airtableCount = 0

    for (const rawRec of rawRecords) {
      const id = String(rawRec.fields['ID'] || rawRec.id)

      // Solo URLs permanentes de WordPress (campo ImagenWP)
      // Las URLs de Airtable expiran y no se incluyen en image-overrides.json
      const imagenWP = rawRec.fields['ImagenWP'] || ''
      if (typeof imagenWP === 'string' && imagenWP.trim()) {
        // Normalizar separadores: ". https://" → ",https://" (corrige typo en Airtable)
        const normalized = imagenWP.replace(/\.\s+(https?:\/\/)/g, ',$1')
        const wpUrls = normalized
          .split(',')
          .map(u => u.trim().replace(/\.$/, ''))
          .filter(u => u.startsWith('http'))
        if (wpUrls.length > 0) {
          imageOverrides[id] = wpUrls
          wpCount++
        }
      } else {
        airtableCount++ // Cuenta los que no tienen WP (no se agregan al override)
      }
    }

    const imgOverridesPath = path.join(ROOT_DIR, 'public', 'image-overrides.json')
    fs.writeFileSync(imgOverridesPath, JSON.stringify(imageOverrides, null, 2), 'utf8')
    console.log(`✅ image-overrides.json actualizado: ${imgOverridesPath}`)
    console.log(`   → ${wpCount} servicios con imágenes de WordPress (permanentes)`)
    console.log(`   → ${airtableCount} servicios con imágenes de Airtable (temporales)`)

    // Sincronizar src/data/image-overrides.json (bundleado en el JS)
    // formato: { [id]: { urls: string[] } }
    const bundled = {}
    for (const [id, urls] of Object.entries(imageOverrides)) {
      bundled[id] = { urls }
    }
    const srcImgOverridesPath = path.join(ROOT_DIR, 'src', 'data', 'image-overrides.json')
    fs.writeFileSync(srcImgOverridesPath, JSON.stringify(bundled, null, 2), 'utf8')
    console.log(`✅ src/data/image-overrides.json sincronizado (bundleado en el JS)`)

    // Verificar vencimiento solo de las URLs de Airtable
    if (airtableCount > 0) {
      const sampleAirtableUrl = Object.values(imageOverrides)
        .flat()
        .find(u => u.includes('airtableusercontent.com')) || ''
      const tsMatch = sampleAirtableUrl.match(/\/(\d{13})\//)
      if (tsMatch) {
        const expiry = new Date(parseInt(tsMatch[1]))
        const hoursLeft = ((parseInt(tsMatch[1]) - Date.now()) / (1000 * 60 * 60)).toFixed(1)
        console.log(`\n⏰ URLs de Airtable vencen: ${expiry.toISOString()}`)
        console.log(`   Horas restantes: ${hoursLeft}h`)
        if (parseFloat(hoursLeft) < 24) {
          console.log('   ⚠️  Agrega ImagenWP en Airtable para los servicios restantes')
          console.log('      o vuelve a ejecutar este script antes del próximo deploy.')
        }
      }
    }
    if (wpCount > 0) {
      console.log(`\n✅ ${wpCount} servicios con imágenes permanentes de WordPress (no expiran).`)
    }

    console.log('')
    console.log('Próximos pasos:')
    console.log('  1. npm run dev  → verificar que los servicios e imágenes cargan')
    console.log('  2. npm run build → compilar para producción')
    console.log('  3. Subir TODA la carpeta dist/ a WordPress')
    console.log('     (incluye el nuevo image-overrides.json con URLs frescas)')
    console.log('')
    console.log('💡 TIP: ejecuta este script antes de cada deploy para URLs frescas.')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    if (error.message.includes('401')) {
      console.error('   El token AIRTABLE_API_KEY es inválido o expiró.')
      console.error('   Genera uno nuevo en: https://airtable.com/create/tokens')
    }
    process.exit(1)
  }
}

main()
