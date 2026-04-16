/**
 * Script para crear las tablas Tiquetes_Aereos y Traslados en Airtable
 *
 * REQUISITO: Token con scope "schema:bases:write"
 * Pasos:
 *   1. Ve a https://airtable.com/create/tokens
 *   2. Crea un token con scope: schema:bases:write + data:records:read
 *   3. Pégalo en la variable TOKEN abajo
 *   4. Ejecuta: node scripts/crear-tablas-cotizador.js
 */

const https = require('https')

const TOKEN = 'PEGAR_AQUI_TOKEN_CON_PERMISOS_SCHEMA'
const BASE_ID = 'appiReH55Qhrbv4Lk'

function createTable(name, fields) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ name, fields })
    const options = {
      hostname: 'api.airtable.com',
      path: `/v0/meta/bases/${BASE_ID}/tables`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }
    let data = ''
    const req = https.request(options, res => {
      res.on('data', d => data += d)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) }
        catch (e) { reject(data) }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

const TIQUETES_FIELDS = [
  { name: 'Nombre', type: 'singleLineText' },
  { name: 'Descripcion', type: 'multilineText' },
  { name: 'Origen', type: 'singleLineText' },
  { name: 'Destino', type: 'singleLineText' },
  { name: 'Aerolinea', type: 'singleLineText' },
  { name: 'Tipo_Vuelo', type: 'singleSelect', options: { choices: [{ name: 'Directo' }, { name: 'Con escala' }] } },
  { name: 'Precio_Adulto', type: 'currency', options: { precision: 0, symbol: '$' } },
  { name: 'Tasas_Adulto', type: 'currency', options: { precision: 0, symbol: '$' } },
  { name: 'Precio_Nino', type: 'currency', options: { precision: 0, symbol: '$' } },
  { name: 'Tasas_Nino', type: 'currency', options: { precision: 0, symbol: '$' } },
  { name: 'Precio_Bebe', type: 'currency', options: { precision: 0, symbol: '$' } },
  { name: 'Incluye_Equipaje', type: 'checkbox', options: { icon: 'check', color: 'greenBright' } },
  { name: 'Equipaje_Bodega_KG', type: 'number', options: { precision: 0 } },
  { name: 'Horario_Salida', type: 'singleLineText' },
  { name: 'Duracion_Vuelo', type: 'singleLineText' },
  { name: 'Dias_Operacion', type: 'singleLineText' },
  { name: 'Moneda', type: 'singleSelect', options: { choices: [{ name: 'COP' }, { name: 'USD' }] } },
  { name: 'Operador_Aliado', type: 'singleLineText' },
  { name: 'Telefono_Contacto', type: 'phoneNumber' },
  { name: 'Email_Contacto', type: 'email' },
  { name: 'Publicado', type: 'checkbox', options: { icon: 'check', color: 'greenBright' } },
  { name: 'Estado', type: 'singleSelect', options: { choices: [{ name: 'Activo' }, { name: 'Inactivo' }, { name: 'Pendiente' }] } },
  { name: 'Notas_Admin', type: 'multilineText' },
]

const TRASLADOS_FIELDS = [
  { name: 'Nombre', type: 'singleLineText' },
  { name: 'Descripcion', type: 'multilineText' },
  { name: 'Tipo', type: 'singleSelect', options: { choices: [{ name: 'Taxi' }, { name: 'Transfer Privado' }, { name: 'Transfer Compartido' }, { name: 'Lancha' }, { name: 'Mototaxi' }] } },
  { name: 'Origen', type: 'singleLineText' },
  { name: 'Destino', type: 'singleLineText' },
  { name: 'Precio_Base', type: 'currency', options: { precision: 0, symbol: '$' } },
  { name: 'Precio_Por_Persona', type: 'currency', options: { precision: 0, symbol: '$' } },
  { name: 'Capacidad_Max_Pasajeros', type: 'number', options: { precision: 0 } },
  { name: 'Tipo_Vehiculo', type: 'singleSelect', options: { choices: [{ name: 'Taxi' }, { name: 'Van' }, { name: 'Bus' }, { name: 'Lancha' }, { name: 'Moto' }] } },
  { name: 'Disponibilidad_24h', type: 'checkbox', options: { icon: 'check', color: 'greenBright' } },
  { name: 'Dias_Operacion', type: 'singleLineText' },
  { name: 'Tiempo_Estimado', type: 'singleLineText' },
  { name: 'Incluye_Equipaje', type: 'checkbox', options: { icon: 'check', color: 'greenBright' } },
  { name: 'Operador_Aliado', type: 'singleLineText' },
  { name: 'Telefono_Contacto', type: 'phoneNumber' },
  { name: 'Email_Contacto', type: 'email' },
  { name: 'Publicado', type: 'checkbox', options: { icon: 'check', color: 'greenBright' } },
  { name: 'Estado', type: 'singleSelect', options: { choices: [{ name: 'Activo' }, { name: 'Inactivo' }, { name: 'Pendiente' }] } },
  { name: 'Notas_Admin', type: 'multilineText' },
]

async function main() {
  if (TOKEN === 'PEGAR_AQUI_TOKEN_CON_PERMISOS_SCHEMA') {
    console.error('❌ Reemplaza TOKEN con tu Personal Access Token de Airtable')
    process.exit(1)
  }

  console.log('Creando Tiquetes_Aereos...')
  const r1 = await createTable('Tiquetes_Aereos', TIQUETES_FIELDS)
  if (r1.id) console.log('✅ Tiquetes_Aereos creada:', r1.id)
  else console.log('❌ Error Tiquetes:', JSON.stringify(r1.error || r1))

  console.log('Creando Traslados...')
  const r2 = await createTable('Traslados', TRASLADOS_FIELDS)
  if (r2.id) console.log('✅ Traslados creada:', r2.id)
  else console.log('❌ Error Traslados:', JSON.stringify(r2.error || r2))
}

main().catch(console.error)
