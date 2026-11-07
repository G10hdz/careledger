import { CAREGIVER_HOURLY_RATE_MXN, categories, type Provider } from './marketplace'

const names = [['Dra. Elena Ruiz', 'Dr. Mateo Ríos', 'Consultorio del barrio'], ['María Salas', 'Lucía Torres', 'Centro de escucha'], ['Ana Paredes', 'Daniel Vega', 'Movimiento cercano'], ['Rosa Méndez', 'Patricia Cruz', 'Cuidados en casa'], ['Movilidad contigo', 'Ruta accesible', 'Traslado seguro']]

const acreditaciones: Record<string, string> = { 'Rosa Méndez': 'SER-017', 'Patricia Cruz': 'SER-042' }

export const providers: Provider[] = categories.flatMap((category, i) =>
  (names[i] ?? []).map((name, j) => {
    const accredited = category === 'Enfermería' && Boolean(acreditaciones[name])
    return {
      id: `${i}-${j}`,
      name,
      category,
      zones: j === 2 ? ['Roma-Condesa', 'Del Valle'] : ['Roma-Condesa'],
      price: accredited ? CAREGIVER_HOURLY_RATE_MXN : ([350, 500, 700][j] ?? 0),
      public: false,
      availability: ['Lunes a viernes · mañana', 'Lunes a sábado · tarde', 'Con cita previa'][j] ?? '',
      certification: category === 'Transporte especializado' ? 'Capacitación en traslado accesible' : 'Credencial profesional verificada',
      accredited,
      ...(accredited ? { accreditationId: acreditaciones[name] } : {}),
    }
  }),
)

providers.push({ id: 'publico-1', name: 'Centro municipal de salud', category: 'Medicina', zones: ['Roma-Condesa', 'Del Valle'], price: 0, public: true, availability: 'Lunes a viernes · mañana', certification: 'Servicio municipal verificado', accredited: false }, { id: 'publico-2', name: 'Movilidad municipal accesible', category: 'Transporte especializado', zones: ['Roma-Condesa', 'Del Valle'], price: 50, public: true, availability: 'Con cita previa', certification: 'Servicio municipal verificado', accredited: false })
