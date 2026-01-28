/**
 * GuiaSAI Services - Integración con Airtable
 * Trae datos de ServiciosTuristicos_SAI para cotizaciones
 */

import axios from 'axios'

const AIRTABLE_API_KEY = (import.meta.env as Record<string, any>).VITE_AIRTABLE_API_KEY || ''
const AIRTABLE_BASE_ID = (import.meta.env as Record<string, any>).VITE_AIRTABLE_BASE_ID || ''
const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`

const TABLES = {
  SERVICIOS: 'ServiciosTuristicos_SAI',
  COTIZACIONES: 'CotizacionesGG',
  COTIZACIONES_ITEMS: 'Cotizaciones_Items', // 🔧 Nombre exacto de la tabla
}

const getHeaders = () => ({
  Authorization: `Bearer ${AIRTABLE_API_KEY}`,
  'Content-Type': 'application/json',
})

// Normaliza valores que podrían llegar como texto o array a un array de strings
function normalizeToArray(value: any): string[] {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === 'string') return [value].filter(Boolean)
  return []
}

// =========================================================
// 🔧 HELPERS
// =========================================================

/**
 * Parsea el campo Dias_Operacion o Horarios de Operacion para extraer horarios
 * Soporta múltiples formatos:
 * - "Lun-Vie: 09:00, 14:00 | Sab: 10:00"
 * - "09:00, 14:00, 18:00"
 * - "6:00 PM - 8:00 PM" (formato 12h)
 * Retorna array de horarios únicos: ["09:00", "14:00", "18:00"]
 */
function parseHorarios(diasOperacion: string): string[] {
  if (!diasOperacion || typeof diasOperacion !== 'string') return []
  
  try {
    // Buscar todos los patrones de hora HH:MM (24h)
    const horariosMatch = diasOperacion.match(/\d{1,2}:\d{2}/g)
    
    if (!horariosMatch || horariosMatch.length === 0) {
      // Intentar formato 12h (XX:XX AM/PM)
      const horariosMatch12 = diasOperacion.match(/\d{1,2}:\d{2}\s*(AM|PM|am|pm)/gi)
      if (horariosMatch12) {
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
        }).filter(Boolean) as string[]
        
        if (convertidos.length > 0) {
          const unicos = [...new Set(convertidos)]
          return unicos.sort()
        }
      }
      return []
    }
    
    // Eliminar duplicados y ordenar
    const horariosUnicos = [...new Set(horariosMatch)]
    return horariosUnicos.sort()
  } catch (error) {
    console.warn('Error parseando horarios:', error)
    return []
  }
}

/**
 * Calcula el precio de un alojamiento según tipo y número de huéspedes
 * 
 * Lógica:
 * - Hotel/Casa/Villa/Finca/Apartamentos/Aparta Hotel: Precio fijo por noche (no depende de huéspedes)
 * - Habitación: Precio según # huéspedes
 * 
 * @param accommodation Objeto del alojamiento
 * @param numHuespedes Número total de huéspedes (adultos + niños)
 * @returns Precio por noche en COP
 */
export function calculateAccommodationPrice(accommodation: any, numHuespedes: number): number {
  const tipo = accommodation.accommodationType || 'Hotel'
  
  // Tipos que cobran precio fijo por noche (no depende de cantidad de huéspedes)
  const tiposPrecioFijo = ['Hotel', 'Casa', 'Villa', 'Finca', 'Posada Nativa', 'Hotel boutique', 'Apartamentos', 'Aparta Hotel']
  
  if (tiposPrecioFijo.includes(tipo)) {
    // Precio fijo por noche, sin importar cantidad de huéspedes
    return accommodation.precioActualizado || accommodation.precioBase || 0
  }
  
  // Habitación: cobrar según # huéspedes (usa campos específicos por cantidad)
  if (numHuespedes === 1) {
    return accommodation.precio1Huesped || accommodation.precioActualizado || 0
  } else if (numHuespedes === 2) {
    return accommodation.precio2Huespedes || accommodation.precioActualizado || 0
  } else if (numHuespedes === 3) {
    return accommodation.precio3Huespedes || accommodation.precioActualizado || 0
  } else if (numHuespedes >= 4) {
    return accommodation.precio4Huespedes || accommodation.precioActualizado || 0
  }
  
  return accommodation.precioActualizado || accommodation.precioBase || 0
}

/**
 * Calcula el precio total de un tour según el número de pasajeros
 * 
 * Lógica especial:
 * - Jetski (30 y 60 minutos): Precio fijo para 2 pasajeros (capacidad = 2)
 * - Otros tours: Precio por persona x número de pasajeros
 * 
 * @param tour Objeto del tour
 * @param numPasajeros Número de pasajeros
 * @returns Precio total en COP
 */
export function calculateTourPrice(tour: any, numPasajeros: number): number {
  const tourName = (tour.nombre || '').toLowerCase()
  
  // 🚤 Jetski: tiene capacidad para 2 personas y se cobra una tarifa fija
  if (tourName.includes('jetski') || tourName.includes('jet ski')) {
    // El precio en 'precioPerPerson' es la tarifa para los 2 pasajeros
    // No multiplicar por número de pasajeros, es el precio total por unidad
    const precioJetski = tour.precioPerPerson || tour.precioBase || 0
    
    // Si son más de 2 pasajeros, cobrar múltiples jetskis
    // Ej: 4 pasajeros = 2 jetskis
    if (numPasajeros > 2) {
      const jetkisNecesarios = Math.ceil(numPasajeros / 2)
      return precioJetski * jetkisNecesarios
    }
    
    return precioJetski
  }
  
  // 🎫 Otros tours: cobrar por persona
  const precioPerPerson = tour.precioPerPerson || tour.precioBase || 0
  return precioPerPerson * numPasajeros
}

// =========================================================
// 🆕 COTIZACIONES (CREACIÓN B2B → Airtable)
// =========================================================

export async function createCotizacionGG(payload: {
  nombre: string
  email: string
  telefono: string
  fechaInicio?: string
  fechaFin?: string
  adultos?: number
  ninos?: number
  bebes?: number
  precioTotal: number
  notasInternas?: string
  // 🆕 Nuevos campos para el resumen
  cotizacionItems?: string  // Resumen de tours/alojamientos seleccionados
  accommodations?: any[]    // Items de alojamientos
  tours?: any[]            // Items de tours
  transports?: any[]       // Items de transportes
}) {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    throw new Error('Airtable no está configurado (VITE_AIRTABLE_API_KEY / VITE_AIRTABLE_BASE_ID)')
  }

  try {
    const url = `${AIRTABLE_API_URL}/${encodeURIComponent(TABLES.COTIZACIONES)}`
    const fields: Record<string, any> = {}

    // 🆕 Generar ID único de cotización en el formato requerido
    const timestamp = Date.now()
    const cotizacionId = `Cotización QT-${timestamp}`

    // Campos obligatorios
    if (payload.nombre) fields.Nombre = payload.nombre
    if (payload.email) fields.Email = payload.email
    if (payload.telefono) fields.Telefono = payload.telefono
    if (payload.precioTotal !== undefined) fields['Precio total'] = payload.precioTotal

    // Campos opcionales
    if (payload.fechaInicio) fields['Fecha Inicio'] = payload.fechaInicio
    if (payload.fechaFin) fields['Fecha Fin'] = payload.fechaFin
    if (payload.adultos !== undefined && payload.adultos > 0) fields['Adultos 18 - 99 años'] = payload.adultos
    if (payload.ninos !== undefined && payload.ninos > 0) fields['Niños 4 - 17 años'] = payload.ninos
    if (payload.bebes !== undefined && payload.bebes > 0) fields['Bebes 0 - 3 años'] = payload.bebes

    // 🆕 Generar resumen detallado de los items seleccionados
    let resumenCompleto = ''
    if (payload.accommodations || payload.tours || payload.transports) {
      const resumen = generateCotizacionSummary({
        accommodations: payload.accommodations || [],
        tours: payload.tours || [],
        transports: payload.transports || []
      })
      resumenCompleto = resumen
      fields['Cotizaciones_Items'] = resumen  // 🆕 Campo para el resumen de items
    }

    // 🆕 Incluir ID de cotización en las notas internas
    const notasConId = `${cotizacionId}

${payload.notasInternas || 'Generada desde portal de agencias (B2B)'}

RESUMEN DE SERVICIOS:
${resumenCompleto}`

    fields['Notas internas'] = notasConId

    console.log('📤 Enviando cotización a Airtable CotizacionesGG con campos:', JSON.stringify(fields, null, 2))
    const response = await axios.post(url, { fields }, { headers: getHeaders() })
    console.log('✅ Cotización creada con ID:', response.data?.id, '| Cotización:', cotizacionId)
    
    // Retornar tanto el ID de Airtable como el ID de la cotización
    return {
      airtableId: response.data?.id as string,
      cotizacionId: cotizacionId
    }
  } catch (error: any) {
    console.error('❌ Error detallado en createCotizacionGG:', {
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: JSON.stringify(error?.response?.data),
      message: error?.message,
    })
    throw error
  }
}

// 🆕 Función para generar el resumen detallado de la cotización
function generateCotizacionSummary(data: {
  accommodations: any[]
  tours: any[]
  transports: any[]
}): string {
  let resumen = []

  // 🏨 ALOJAMIENTOS
  if (data.accommodations && data.accommodations.length > 0) {
    resumen.push("🏨 ALOJAMIENTOS:")
    data.accommodations.forEach((acc, index) => {
      const checkIn = acc.checkIn instanceof Date ? acc.checkIn.toLocaleDateString('es-CO') : new Date(acc.checkIn).toLocaleDateString('es-CO')
      const checkOut = acc.checkOut instanceof Date ? acc.checkOut.toLocaleDateString('es-CO') : new Date(acc.checkOut).toLocaleDateString('es-CO')
      
      resumen.push(`${index + 1}. ${acc.hotelName}`)
      resumen.push(`   • Fechas: ${checkIn} al ${checkOut}`)
      resumen.push(`   • Noches: ${acc.nights}`)
      resumen.push(`   • Habitaciones: ${acc.quantity}`)
      resumen.push(`   • Huéspedes: ${acc.adults} adultos${acc.children ? `, ${acc.children} niños` : ''}`)
      resumen.push(`   • Tipo: ${acc.roomType}`)
      resumen.push(`   • Precio: $${acc.total.toLocaleString('es-CO')} COP`)
      resumen.push('')
    })
  }

  // 🎫 TOURS
  if (data.tours && data.tours.length > 0) {
    resumen.push("🎫 TOURS:")
    data.tours.forEach((tour, index) => {
      const fecha = tour.date instanceof Date ? tour.date.toLocaleDateString('es-CO') : new Date(tour.date).toLocaleDateString('es-CO')
      
      resumen.push(`${index + 1}. ${tour.tourName}`)
      resumen.push(`   • Fecha: ${fecha}`)
      if (tour.schedule) {
        resumen.push(`   • Horario: ${tour.schedule}`)
      }
      resumen.push(`   • Duración: ${tour.duration}`)
      resumen.push(`   • Participantes: ${tour.quantity} personas`)
      if (tour.included && tour.included.length > 0) {
        resumen.push(`   • Incluye: ${tour.included.slice(0, 3).join(', ')}${tour.included.length > 3 ? '...' : ''}`)
      }
      resumen.push(`   • Precio: $${tour.total.toLocaleString('es-CO')} COP`)
      resumen.push('')
    })
  }

  // 🚕 TRANSPORTES
  if (data.transports && data.transports.length > 0) {
    resumen.push("🚕 TRANSPORTES:")
    data.transports.forEach((transport, index) => {
      const fecha = transport.date instanceof Date ? transport.date.toLocaleDateString('es-CO') : new Date(transport.date).toLocaleDateString('es-CO')
      
      resumen.push(`${index + 1}. ${transport.vehicleType}`)
      resumen.push(`   • Ruta: ${transport.origin} → ${transport.destination}`)
      resumen.push(`   • Fecha: ${fecha}`)
      if (transport.time) {
        resumen.push(`   • Hora: ${transport.time}`)
      }
      resumen.push(`   • Vehículos: ${transport.quantity}`)
      resumen.push(`   • Pasajeros: ${transport.totalPassengers}`)
      resumen.push(`   • Precio: $${transport.total.toLocaleString('es-CO')} COP`)
      resumen.push('')
    })
  }

  return resumen.join('\n')
}

export async function createCotizacionItemGG(payload: {
  cotizacionId: string
  servicioId: string
  fechaInicio: string
  fechaFin?: string
  adultos?: number
  ninos?: number
  bebes?: number
  precioUnitario?: number
  subtotal: number
}) {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    throw new Error('Airtable no está configurado (VITE_AIRTABLE_API_KEY / VITE_AIRTABLE_BASE_ID)')
  }

  const url = `${AIRTABLE_API_URL}/${encodeURIComponent(TABLES.COTIZACIONES_ITEMS)}`
  const fields: Record<string, any> = {}

  try {
    // 🆕 Por ahora omitimos los campos de vínculo hasta conocer la estructura exacta
    // Incluimos la información como referencia en las notas
    let notasItem = `Cotización ID: ${payload.cotizacionId}\nServicio ID: ${payload.servicioId}`

    // Fechas - solo si existen
    if (payload.fechaInicio) {
      fields['Fecha Inicio'] = payload.fechaInicio
    }
    if (payload.fechaFin) {
      fields['Fecha Fin'] = payload.fechaFin
    }

    // Precios - incluir aunque sean 0
    if (payload.precioUnitario !== undefined) {
      fields['Precio Unitario'] = payload.precioUnitario
    }
    if (payload.subtotal !== undefined) {
      fields['Precio Subtotal'] = payload.subtotal
    }

    // Pasajeros - incluir solo si > 0
    if (payload.adultos !== undefined && payload.adultos > 0) {
      fields['Adultos 18 - 99 años'] = payload.adultos
    }
    if (payload.ninos !== undefined && payload.ninos > 0) {
      fields['Niños 4 - 17 años'] = payload.ninos
    }
    if (payload.bebes !== undefined && payload.bebes > 0) {
      fields['Bebes 0 - 3 años'] = payload.bebes
    }

    // 🆕 Agregar notas con los IDs de referencia
    if (fields['Notas internas']) {
      fields['Notas internas'] = fields['Notas internas'] + '\n\n' + notasItem
    } else {
      fields['Notas internas'] = notasItem
    }

    console.log('📤 Enviando item a Airtable cotizaciones_Items con campos:', JSON.stringify(fields, null, 2))
    console.log('📋 Payload original:', JSON.stringify(payload, null, 2))
    const response = await axios.post(url, { fields }, { headers: getHeaders() })
    console.log('✅ Item creado con ID:', response.data?.id)
    return response.data?.id as string
  } catch (error: any) {
    const airtableError = error?.response?.data?.error
    console.error('❌ Error detallado en createCotizacionItemGG:', {
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      airtableError,
      errorMessage: airtableError?.message,
      invalidFields: airtableError?.invalidFields,
      fields,
      payload
    })
    console.error('🔍 Airtable full response:', JSON.stringify(error?.response?.data, null, 2))
    
    // 🆕 Intentar crear el item sin los campos de vínculo si fallan
    if (airtableError?.message?.includes('Value is not an array of record IDs')) {
      console.warn('⚠️ Reintentando sin campos de vínculo...')
      try {
        const fieldsWithoutLinks = { ...fields }
        delete fieldsWithoutLinks['CotizacionesGG']
        delete fieldsWithoutLinks['ServiciosTuristicos_SAI']
        
        const fallbackResponse = await axios.post(url, { fields: fieldsWithoutLinks }, { headers: getHeaders() })
        console.log('✅ Item creado sin vínculos con ID:', fallbackResponse.data?.id)
        return fallbackResponse.data?.id as string
      } catch (fallbackError) {
        console.error('❌ También falló el fallback:', fallbackError)
      }
    }
    
    throw error
  }
}

// =========================================================
// 🏨 ALOJAMIENTOS
// =========================================================

export async function getAccommodations() {
  try {
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      console.warn('⚠️ Airtable no configurado')
      return getMockAccommodations()
    }

    const url = `${AIRTABLE_API_URL}/${encodeURIComponent(TABLES.SERVICIOS)}`
    const filterByFormula = `AND({Tipo de Servicio} = 'Alojamiento', {Publicado} = 1)`

    const response = await axios.get(url, {
      headers: getHeaders(),
      params: {
        filterByFormula,
        maxRecords: 50,
      },
    })

    return response.data.records.map((record: any) => ({
      id: record.id,
      nombre: record.fields.Servicio || record.fields.Nombre || 'Sin nombre',
      descripcion: record.fields.Descripcion || '',
      categoria: record.fields['Tipo de Servicio'] || record.fields.Categoria || 'Alojamiento',
      publicado: record.fields.Publicado === true,
      
      // 🆕 Tipo de Alojamiento (determina cómo se cobra)
      accommodationType: record.fields['Tipo de Alojamiento'] || 'Hotel',
      
      // 🆕 Precios por cantidad de huéspedes
      precioActualizado: parseFloat(record.fields.Precio || record.fields['Precio actualizado'] || 0),
      precio1Huesped: parseFloat(record.fields['Precio 1 Huesped'] || record.fields.Precio || 0), // 1 pax
      precio2Huespedes: parseFloat(record.fields['Precio 2 Huespedes'] || record.fields.Precio || 0), // 2 pax
      precio3Huespedes: parseFloat(record.fields['Precio 3 Huespedes'] || record.fields.Precio || 0), // 3 pax
      precio4Huespedes: parseFloat(record.fields['Precio 4+ Huespedes'] || record.fields.Precio || 0), // 4+ pax
      
      precioBase: parseFloat(record.fields.Precio || record.fields.PrecioBase || 0),
      precioMin: parseFloat(record.fields.PrecioMin || record.fields.Precio || 0),
      precioMax: parseFloat(record.fields.PrecioMax || record.fields.Precio || 0),
      capacidad: parseInt(record.fields['Capacidad Maxima'] || record.fields.Capacidad || 0),
      ubicacion: record.fields.Ubicacion || '',
      telefono: record.fields['Telefono Contacto'] || record.fields.Telefono || '',
      email: record.fields['Email Contacto'] || record.fields.Email || '',
      // Extraer URLs de attachments (Airtable devuelve arrays de objetos con propiedad 'url')
      imageUrl: record.fields.Imagenurl?.[0]?.url || record.fields.ImagenURL?.[0]?.url || 
                record.fields.Imagenurl?.[0] || record.fields.ImagenURL?.[0] || '',
      images: (record.fields.Imagenurl || record.fields.ImagenURL || []).map((img: any) => 
        typeof img === 'string' ? img : img?.url || ''
      ).filter((url: string) => url), // 🆕 Array completo de imágenes
      estrellas: parseInt(record.fields.Rating || record.fields.Estrellas || 0),
      
      // 🆕 Amenities (servicios del alojamiento)
      amenities: record.fields.Amenities || [],
      servicios: record.fields.Servicios || record.fields.Amenities || [],
      
      disabledDates: record.fields.FechasDeshabilitadas || [],
      horarioCheckIn: record.fields.HorarioCheckIn || '14:00',
      horarioCheckOut: record.fields.HorarioCheckOut || '11:00',
    }))
  } catch (error) {
    console.error('❌ Error obteniendo alojamientos:', error)
    return getMockAccommodations()
  }
}

// =========================================================
// 🎫 TOURS
// =========================================================

export async function getTours() {
  try {
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      console.warn('⚠️ Airtable no configurado')
      return getMockTours()
    }

    const url = `${AIRTABLE_API_URL}/${encodeURIComponent(TABLES.SERVICIOS)}`
    const filterByFormula = `AND({Tipo de Servicio} = 'Tour', {Publicado} = 1)`

    const response = await axios.get(url, {
      headers: getHeaders(),
      params: {
        filterByFormula,
        maxRecords: 50,
      },
    })

    const mappedTours = response.data.records.map((record: any) => {
      // 🆕 Extraer horarios del campo Horarios de Operacion (nombre exacto en Airtable)
      const horariosCampo = record.fields['Horarios de Operacion'] || 
                            record.fields['Horarios_Operacion'] ||
                            record.fields.HorariosOperacion ||
                            record.fields['Dias_Operacion'] || 
                            record.fields.DiasOperacion || ''
      
      const horariosExtraidos = parseHorarios(horariosCampo)
      
      const tour = {
        id: record.id,
        nombre: record.fields.Servicio || record.fields.Nombre || 'Sin nombre',
        descripcion: record.fields.Descripcion || record.fields.Itinerario || '',
        categoria: record.fields['Tipo de Servicio'] || record.fields.Categoria || 'Tour',
        publicado: record.fields.Publicado === true,
        precioBase: parseFloat(record.fields['Precio actualizado'] || record.fields.Precio || record.fields.PrecioBase || 0),
        precioPerPerson: parseFloat(record.fields['Precio actualizado'] || record.fields.Precio || record.fields.PrecioPerPerson || 0),
        duracion: record.fields.Duracion || '4 horas',
        capacidad: parseInt(record.fields.Capacidad || 10),
        ubicacion: record.fields.Ubicacion || '',
        telefono: record.fields['Telefono Contacto'] || record.fields.Telefono || '',
        email: record.fields['Email Contacto'] || record.fields.Email || '',
        // Extraer URLs de attachments (Airtable devuelve arrays de objetos con propiedad 'url')
        imageUrl: record.fields.Imagenurl?.[0]?.url || record.fields.ImagenURL?.[0]?.url || 
                  record.fields.Imagenurl?.[0] || record.fields.ImagenURL?.[0] || '',
        images: (record.fields.Imagenurl || record.fields.ImagenURL || []).map((img: any) => 
          typeof img === 'string' ? img : img?.url || ''
        ).filter((url: string) => url), // 🆕 Array completo de imágenes
        
        // 🆕 Horarios de operación desde Airtable
        diasOperacion: horariosCampo,
        horarios: horariosExtraidos, // 🔧 IMPORTANTE: Array de horarios disponibles
        horariosDisponibles: horariosExtraidos,
        horariosOperacion: horariosCampo,
        
        horarioInicio: record.fields.HorarioInicio || record.fields['Horario Inicio'] || '08:00',
        horarioFin: record.fields.HorarioFin || record.fields['Horario Fin'] || '16:00',
        incluye: normalizeToArray(record.fields.Incluye || record.fields['que Incluye']),
        noIncluye: normalizeToArray(record.fields.NoIncluye),
        dificultad: record.fields.Dificultad || 'Fácil',
      }
      
      // 🔍 DEBUG: Mostrar si el tour tiene horarios
      if (horariosExtraidos.length > 0) {
        console.log(`📍 Tour: ${tour.nombre} | Horarios: ${horariosExtraidos.join(', ')} | Campo: ${horariosCampo}`)
      } else {
        console.warn(`⚠️ Tour sin horarios: ${tour.nombre} | Campo Horarios: "${horariosCampo}"`)
      }
      
      return tour
    })
    
    return mappedTours
  } catch (error) {
    console.error('❌ Error obteniendo tours:', error)
    return getMockTours()
  }
}

// =========================================================
// 🚕 TRASLADOS
// =========================================================

export async function getTransports() {
  try {
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      console.warn('⚠️ Airtable no configurado')
      return getMockTransports()
    }

    const url = `${AIRTABLE_API_URL}/${encodeURIComponent(TABLES.SERVICIOS)}`
    const filterByFormula = `AND({Categoria} = 'Transporte', {Publicado} = 1)`

    const response = await axios.get(url, {
      headers: getHeaders(),
      params: {
        filterByFormula,
        maxRecords: 50,
      },
    })

    return response.data.records.map((record: any) => ({
      id: record.id,
      nombre: record.fields.Nombre || 'Sin nombre',
      descripcion: record.fields.Descripcion || '',
      categoria: record.fields.Categoria,
      publicado: record.fields.Publicado === true,
      precioBase: parseFloat(record.fields.PrecioBase || 0),
      precioPerVehicle: parseFloat(record.fields.PrecioPerVehicle || record.fields.PrecioBase || 0),
      capacidad: parseInt(record.fields.Capacidad || 5),
      tipo: record.fields.Tipo || 'Automóvil',
      telefono: record.fields.Telefono || '',
      email: record.fields.Email || '',
      operador: record.fields.Operador || '',
      rutas: record.fields.Rutas || ['Aeropuerto-Hotel', 'Hotel-Hotel'],
    }))
  } catch (error) {
    console.error('❌ Error obteniendo transportes:', error)
    return getMockTransports()
  }
}

// =========================================================
// 📦 MOCK DATA (para desarrollo)
// =========================================================

function getMockAccommodations() {
  return [
    {
      id: 'hotel-1',
      nombre: 'Hotel Las Palmeras',
      descripcion: 'Hotel 4 estrellas frente al mar con piscina infinity',
      categoria: 'Alojamiento',
      publicado: true,
      accommodationType: 'Hotel',
      precioActualizado: 500000,
      precio1Huesped: 450000,
      precio2Huespedes: 500000,
      precio3Huespedes: 600000,
      precio4Huespedes: 700000,
      precioBase: 500000,
      precioMin: 450000,
      precioMax: 750000,
      capacidad: 4,
      ubicacion: 'Playa Spratt Bight',
      telefono: '+57 8 5128888',
      email: 'reservas@laspalmeras.com',
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400'
      ],
      estrellas: 4,
      amenities: ['WiFi', 'Aire acondicionado', 'Mini bar', 'TV Cable', 'Piscina'],
      servicios: ['WiFi', 'Aire acondicionado', 'Mini bar', 'TV Cable', 'Piscina'],
      horarioCheckIn: '14:00',
      horarioCheckOut: '11:00',
    },
    {
      categoria: 'Alojamiento',
      publicado: true,
      accommodationType: 'Hotel',
      precioActualizado: 800000,
      precio1Huesped: 700000,
      precio2Huespedes: 800000,
      precio3Huespedes: 950000,
      precio4Huespedes: 1100000,
      precioBase: 800000,
      precioMin: 700000,
      precioMax: 1000000,
      capacidad: 6,
      ubicacion: 'San Luis',
      telefono: '+57 8 5100200',
      email: 'reservas@decameron.com',
      imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400',
      images: [
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400',
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400',
        'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=400'
      ],
      estrellas: 5,
      amenities: ['All Inclusive', 'Playas privadas', 'Restaurantes', 'Animación', 'Spa', 'Gym'],
      servicios: ['All Inclusive', 'Playas privadas', 'Restaurantes', 'Animación', 'Spa', 'Gym'],
      horarioCheckIn: '15:00',
      horarioCheckOut: '12:00',
    },
    {
      id: 'hotel-3',
      nombre: 'Apartamento Miss Mary',
      descripcion: 'Apartamento acogedor con cocina equipada',
      categoria: 'Alojamiento',
      publicado: true,
      accommodationType: 'Apartamentos',
      precioActualizado: 150000,
      precio1Huesped: 150000,
      precio2Huespedes: 200000,
      precio3Huespedes: 250000,
      precio4Huespedes: 300000,
      precioBase: 200000,
      precioMin: 150000,
      precioMax: 300000,
      capacidad: 4,
      ubicacion: 'Centro',
      telefono: '+57 8 5124567',
      email: 'info@missmary.com',
      imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400',
      images: [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400'
      ],
      estrellas: 3,
      amenities: ['WiFi', 'Cocina equipada', 'Aire acondicionado', 'TV Cable'],
      servicios: ['WiFi', 'Cocina equipada', 'Aire acondicionado', 'TV Cable'],
      horarioCheckIn: '14:00',
      horarioCheckOut: '10:00',
    },
  ]
}

function getMockTours() {
  return [
    {
      id: 'tour-1',
      nombre: 'Vuelta a la Isla Cultural',
      descripcion: 'Recorrido completo de 27 km visitando puntos históricos y playas',
      categoria: 'Tour',
      publicado: true,
      precioPerPerson: 150000,
      duracion: '8 horas',
      capacidad: 8,
      ubicacion: 'San Andrés',
      telefono: '+57 8 5150000',
      email: 'tours@guiasai.com',
      diasOperacion: 'Lun-Dom: 08:00, 13:00',
      horarios: ['08:00', '13:00'],
      horariosDisponibles: ['08:00', '13:00'],
      horarioInicio: '08:00',
      horarioFin: '16:00',
      imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
      images: [
        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
        'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=400',
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400'
      ],
      incluye: ['Guía local', 'Almuerzo típico', 'Snacks', 'Fotos'],
      noIncluye: ['Bebidas alcohólicas', 'Propinas'],
      dificultad: 'Fácil',
    },
    {
      id: 'tour-2',
      nombre: 'Snorkel + Manglares',
      descripcion: 'Experiencia ecológica en manglares con snorkel en arrecife',
      categoria: 'Tour',
      publicado: true,
      precioPerPerson: 120000,
      duracion: '4 horas',
      capacidad: 10,
      ubicacion: 'Manglares',
      telefono: '+57 8 5150001',
      email: 'ecoventura@guiasai.com',
      diasOperacion: 'Mar-Sab: 09:00, 14:00',
      horarios: ['09:00', '14:00'],
      horariosDisponibles: ['09:00', '14:00'],
      horarioInicio: '09:00',
      horarioFin: '13:00',
      imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
      images: [
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
        'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=400',
        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400'
      ],
      incluye: ['Equipo snorkel', 'Guía biológico', 'Snacks', 'Agua dulce'],
      noIncluye: ['Transporte desde hotel', 'Fotos profesionales'],
      dificultad: 'Moderado',
    },
    {
      id: 'tour-3',
      nombre: 'Caribbean Night Experience',
      descripcion: 'Cena con música en vivo + experiencia cultural raizal',
      categoria: 'Tour',
      publicado: true,
      precioPerPerson: 200000,
      duracion: '4 horas',
      capacidad: 20,
      ubicacion: 'Centro Cultural',
      telefono: '+57 8 5150002',
      email: 'caribbean@guiasai.com',
      diasOperacion: 'Jue-Sab: 18:00',
      horarios: ['18:00'],
      horariosDisponibles: ['18:00'],
      horarioInicio: '18:00',
      horarioFin: '22:00',
      imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400',
      images: [
        'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400',
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400',
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
        'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400',
        'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400'
      ],
      incluye: ['Cena 3 tiempos', 'Música en vivo', 'Bebida bienvenida', 'Souvenirs'],
      noIncluye: ['Bebidas adicionales'],
      dificultad: 'Fácil',
    },
    {
      id: 'tour-4',
      nombre: 'Eco-Adventure Day',
      descripcion: 'Senderismo en naturaleza + picnic en playa',
      categoria: 'Tour',
      publicado: true,
      precioPerPerson: 100000,
      duracion: '6 horas',
      capacidad: 6,
      ubicacion: 'Zona Sur',
      telefono: '+57 8 5150003',
      email: 'ecotravel@guiasai.com',
      diasOperacion: 'Lun-Vie: 07:00',
      horarios: ['07:00'],
      horariosDisponibles: ['07:00'],
      horarioInicio: '07:00',
      horarioFin: '13:00',
      imageUrl: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=400',
      incluye: ['Guía naturalista', 'Picnic en playa', 'Transporte 4x4', 'Binoculares'],
      noIncluye: ['Equipo montañismo'],
      dificultad: 'Difícil',
    },
  ]
}

function getMockTransports() {
  return [
    {
      id: 'trans-1',
      nombre: 'Coop de Taxis Unidos',
      descripcion: 'Servicio de taxis con choferes certificados',
      categoria: 'Transporte',
      publicado: true,
      precioPerVehicle: 200000,
      capacidad: 4,
      tipo: 'Automóvil',
      telefono: '+57 8 5180000',
      email: 'reservas@taximun.com',
      imageUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400',
      operador: 'Coop Taxis',
      rutas: ['Aeropuerto-Hotel', 'Hotel-Hotel', 'Tours'],
    },
    {
      id: 'trans-2',
      nombre: 'Minivan Premium',
      descripcion: 'Servicio de minivanes con aire acondicionado',
      categoria: 'Transporte',
      publicado: true,
      precioPerVehicle: 350000,
      capacidad: 8,
      tipo: 'Minivan',
      telefono: '+57 8 5180001',
      email: 'minivans@guiasai.com',
      imageUrl: 'https://images.unsplash.com/photo-1552799446-159ba9523315?w=400',
      operador: 'TransGO',
      rutas: ['Aeropuerto-Hotel', 'Grupos'],
    },
    {
      id: 'trans-3',
      nombre: 'Lancha Privada',
      descripcion: 'Transporte acuático a Old Providence',
      categoria: 'Transporte',
      publicado: true,
      precioPerVehicle: 500000,
      capacidad: 12,
      tipo: 'Lancha',
      telefono: '+57 8 5180002',
      email: 'lanchas@guiasai.com',
      imageUrl: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=400',
      operador: 'Caribbean Boats',
      rutas: ['San Andrés-Providencia'],
    },
  ]
}
