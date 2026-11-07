import type { Lang } from './langs'

export type CourseLine = 'tecnica' | 'digital'
export type CourseLevel = 'inicial' | 'intermedio'

type Text = Record<Lang, string>

export interface CourseModule {
  id: string
  minutes: number
  title: Text
  body: Text
}

export interface Course {
  id: string
  line: CourseLine
  level: CourseLevel
  minutes: number
  title: Text
  summary: Text
  modules: CourseModule[]
}

const es = (text: string): string => text

/**
 * Catálogo local. No es un LMS: cada módulo es una lectura corta que se
 * puede terminar sin red. Los textos en náhuatl son un borrador cívico
 * para el selector; las indicaciones de seguridad van también en español.
 * Los id de la tabla COURSE_POINTS (dominio) emiten puntos al completar.
 */
export const COURSES: Course[] = [
  {
    id: 'movilizacion',
    line: 'tecnica',
    level: 'inicial',
    minutes: 20,
    title: {
      es: 'Movilización segura',
      en: 'Safe moving',
      nah: 'Tlatlaliliztli segura',
    },
    summary: {
      es: 'Cómo ayudar a alguien a levantarse sin lastimarte la espalda.',
      en: 'How to help someone get up without hurting your back.',
      nah: 'Kenin tikpalehuia ma mewa, amo tikmokokoa motlankuayo. En español abajo.',
    },
    modules: [
      {
        id: 'mov-1',
        minutes: 10,
        title: { es: 'Antes de mover', en: 'Before you move someone', nah: 'Achto' },
        body: {
          es: es(
            'Acércate, flexiona las rodillas y pide que la persona ayude en lo que pueda. No cargues con la espalda. Si la cama está alta, bájala antes.',
          ),
          en: 'Stand close, bend your knees, and ask the person to help as they can. Do not lift with your back. Lower a high bed first.',
          nah: 'Ximonechka uan ximotlancuatzin. Amo xikwika ika motlankuayo. En español: acércate, flexiona las rodillas y no cargues con la espalda.',
        },
      },
      {
        id: 'mov-2',
        minutes: 10,
        title: { es: 'Cuándo detenerte', en: 'When to stop', nah: 'Kemah tiktlaza' },
        body: {
          es: 'Si hay mareo, dolor o miedo, paras y pides apoyo. No dejes a la persona sola en una orilla. Esta lección no pide nombres ni datos de salud.',
          en: 'If there is dizziness, pain, or fear, stop and ask for help. Do not leave the person alone on an edge. This lesson asks for no names or health data.',
          nah: 'Tla momamauhtia noso tekokoa, xikahua. En español: si hay mareo o dolor, te detienes y pides apoyo.',
        },
      },
    ],
  },
  {
    id: 'signos',
    line: 'tecnica',
    level: 'inicial',
    minutes: 15,
    title: {
      es: 'Signos vitales',
      en: 'Vital signs',
      nah: 'Signos vitales',
    },
    summary: {
      es: 'Qué mirar y cuándo buscar ayuda. No es un diagnóstico ni se guarda en la app.',
      en: 'What to notice and when to ask for help. Not a diagnosis, and the app does not store it.',
      nah: 'Tlen tikita uan kemah tiktemoa palehuiliztli. La app amo kikui ni datos.',
    },
    modules: [
      {
        id: 'sig-1',
        minutes: 8,
        title: { es: 'Observar, no diagnosticar', en: 'Notice, do not diagnose', nah: 'Xikita' },
        body: {
          es: 'Mira si respira con calma, si el pecho se mueve parejo y si la piel está muy caliente o muy fría. Observar no es poner un diagnóstico. No anotes eso en EntreManos.',
          en: 'Notice calm breathing, an even chest, and skin that is very hot or very cold. Noticing is not a diagnosis. Do not enter it in EntreManos.',
          nah: 'Xikita tla kualtzin ijiiotl. Amo diagnóstico. En español: observa la respiración y la temperatura de la piel, y no lo anotes en la app.',
        },
      },
      {
        id: 'sig-2',
        minutes: 7,
        title: { es: 'Pedir ayuda', en: 'Ask for help', nah: 'Xiktemo palehuiliztli' },
        body: {
          es: 'Si cuesta despertar, duele el pecho o falta el aire, busca ayuda de salud en ese momento. El curso termina cuando leíste esto. No hay examen ni expediente.',
          en: 'If the person is hard to wake, has chest pain, or cannot breathe, get health help right away. The course ends when you have read this. There is no exam and no medical file.',
          nah: 'Tla amo ueltzin ijiiotl, xiktemo palehuiliztli de salud. En español: falta de aire, dolor de pecho o no despertar: pide ayuda de salud ya.',
        },
      },
    ],
  },
  {
    id: 'medicacion',
    line: 'tecnica',
    level: 'intermedio',
    minutes: 25,
    title: {
      es: 'Medicación segura',
      en: 'Safer medicines',
      nah: 'Pajtli segura',
    },
    summary: {
      es: 'Leer el envase, no duplicar tomas y preguntar si hay duda.',
      en: 'Read the label, do not double a dose, and ask when you are unsure.',
      nah: 'Xikita in envase. Tla amo tikmati, xiktlajtlani.',
    },
    modules: [
      {
        id: 'med-1',
        minutes: 15,
        title: { es: 'El envase manda', en: 'The label leads', nah: 'In envase' },
        body: {
          es: 'Lee el nombre y la hora en el envase. No compartas medicinas ni repitas una toma de memoria. Si ya se tomó, no des otra "por si acaso".',
          en: 'Read the name and the time on the label. Do not share medicines or repeat a dose from memory. If it was already taken, do not give another just in case.',
          nah: 'Xikita in tokayotl uan in hora. Amo xiktemaka oksepa de memoria. En español: lee el envase y no dupliques una toma.',
        },
      },
      {
        id: 'med-2',
        minutes: 10,
        title: { es: 'Si hay duda', en: 'If you are unsure', nah: 'Tla amo tikmati' },
        body: {
          es: 'Pregunta en el centro de salud o en la farmacia del nodo. En un papel puedes anotar el nombre del medicamento. No anotes diagnósticos en esta app.',
          en: 'Ask the health center or the node pharmacy. On paper you can write the medicine name. Do not write diagnoses in this app.',
          nah: 'Xiktlajtlani en el centro de salud. En español: pregunta si hay duda y no escribas diagnósticos aquí.',
        },
      },
    ],
  },
  {
    id: 'telefono',
    line: 'digital',
    level: 'inicial',
    minutes: 15,
    title: {
      es: 'Uso del teléfono',
      en: 'Using the phone',
      nah: 'Teléfono',
    },
    summary: {
      es: 'Letra grande, botones que quepan en el dedo y qué pasa si se va el internet.',
      en: 'Larger type, buttons that fit a finger, and what happens if the internet drops.',
      nah: 'Tlakuilolli ueyi uan botones para un dedo.',
    },
    modules: [
      {
        id: 'tel-1',
        minutes: 8,
        title: { es: 'Ver mejor', en: 'See it clearly', nah: 'Xikita kualtzin' },
        body: {
          es: 'En ajustes del teléfono sube el tamaño de letra. En EntreManos los botones miden al menos el alto de un dedo y el texto no baja de 12.',
          en: 'In the phone settings, increase the text size. In EntreManos the buttons are at least a finger tall and the text stays at 12 or more.',
          nah: 'Xikueyilia in tlakuilolli. En español: sube el tamaño de letra en los ajustes del teléfono.',
        },
      },
      {
        id: 'tel-2',
        minutes: 7,
        title: { es: 'Sin internet', en: 'Without internet', nah: 'Amo internet' },
        body: {
          es: 'Si se corta la red, el registro se queda en el teléfono. Cuando vuelve la señal, se manda solo. No tienes que repetirlo.',
          en: 'If the network drops, the record stays on the phone. When the signal returns, it sends itself. You do not have to enter it again.',
          nah: 'Tla amo onka red, mokahua en el teléfono. En español: se guarda aquí y se manda solo cuando vuelve la señal.',
        },
      },
    ],
  },
  {
    id: 'tramites',
    line: 'digital',
    level: 'inicial',
    minutes: 20,
    title: {
      es: 'Trámites en línea',
      en: 'Online paperwork',
      nah: 'Trámites en línea',
    },
    summary: {
      es: 'Qué datos piden y cómo reconocer un pago que no tocaba.',
      en: 'Which details they ask for, and how to spot a payment that does not belong.',
      nah: 'Tlen datos kitlajtlanilia uan tlen pago amo toca.',
    },
    modules: [
      {
        id: 'tra-1',
        minutes: 10,
        title: { es: 'Datos que sí piden', en: 'Details they may ask', nah: 'Datos' },
        body: {
          es: 'Un trámite puede pedir CURP o correo. La clave no se manda por mensaje ni se le dicta a desconocidos. EntreManos no te pide la clave de otro sitio.',
          en: 'A procedure may ask for an ID number or an email. Do not send a password in a message or read it to a stranger. EntreManos does not ask for another site’s password.',
          nah: 'Amo xiktemaka moklave por mensaje. En español: un trámite puede pedir CURP o correo, nunca tu clave por chat.',
        },
      },
      {
        id: 'tra-2',
        minutes: 10,
        title: { es: 'Un pago raro', en: 'A strange payment', nah: 'Pago amo kualtzin' },
        body: {
          es: 'Si una página pide un pago que nadie te anunció, ciérrala y pregunta en el módulo del nodo. El canje de Puntos Cívicos no pide tarjeta.',
          en: 'If a page asks for a payment nobody told you about, close it and ask at the node desk. Redeeming Civic Points does not ask for a card.',
          nah: 'Tla kitlajtlanilia pago sorpresa, xiktzakua. En español: ciérrala y pregunta en el nodo. El canje no pide tarjeta.',
        },
      },
    ],
  },
  {
    id: 'cuidado-infancias-1',
    line: 'tecnica',
    level: 'inicial',
    minutes: 20,
    title: {
      es: 'Cuidado de infancias',
      en: 'Caring for children',
      nah: 'Cuidado de infancias',
    },
    summary: {
      es: 'Tener cerca a quien cuidas y saber cuándo pedir ayuda. Sin expediente.',
      en: 'Keep the child close and know when to ask for help. No medical file.',
      nah: 'Xikpia nekan. Tla amo kualtzin, xiktemo palehuiliztli. En español: tenla a la vista y pide ayuda si algo se sale de lo cotidiano.',
    },
    modules: [
      {
        id: 'inf-1',
        minutes: 10,
        title: { es: 'A la vista', en: 'In sight', nah: 'Xikita' },
        body: {
          es: 'Una infancia se queda donde la ves. Si vas a otra pieza, la llevas o pides que alguien se quede. Nada de dejarla en una cama alta sin barandal.',
          en: 'A child stays where you can see them. If you leave the room, take them or ask someone to stay. Do not leave them on a high bed without a rail.',
          nah: 'Xikita senpa. En español: se queda a la vista. No la dejes en una cama alta sin barandal.',
        },
      },
      {
        id: 'inf-2',
        minutes: 10,
        title: { es: 'Fuera de lo cotidiano', en: 'Out of the ordinary', nah: 'Amo kualtzin' },
        body: {
          es: 'Si no despierta, se pega fuerte o le falta el aire, buscas ayuda de salud en ese momento. Eso no se anota en EntreManos.',
          en: 'If they will not wake, take a hard fall, or cannot breathe, get health help right then. Do not write that in EntreManos.',
          nah: 'Xiktemo palehuiliztli de salud. En español: no despertar, un golpe fuerte o falta de aire: pide ayuda ya. No lo anotes aquí.',
        },
      },
    ],
  },
  {
    id: 'aseo-bano-paciente-1',
    line: 'tecnica',
    level: 'inicial',
    minutes: 18,
    title: {
      es: 'Aseo y baño',
      en: 'Washing and bathing',
      nah: 'Aseo y baño',
    },
    summary: {
      es: 'Agua templada, privacidad y parar si hay dolor.',
      en: 'Warm water, privacy, and stopping if there is pain.',
      nah: 'Atl templada, privacidad. Tla tekokoa, xikahua. En español: el agua no quema y te detienes si duele.',
    },
    modules: [
      {
        id: 'aseo-1',
        minutes: 10,
        title: { es: 'Agua y privacidad', en: 'Water and privacy', nah: 'Atl' },
        body: {
          es: 'Prueba el agua con el dorso de tu mano: ni quema ni está helada. Cierra la puerta y cubre lo que no estás lavando. Explica qué vas a hacer antes de tocar.',
          en: 'Test the water with the back of your hand: not burning, not freezing. Close the door and cover what you are not washing. Say what you will do before you touch.',
          nah: 'Xikyejyeko in atl. Xiktzakua in puerta. En español: agua templada, puerta cerrada, y avisas antes de tocar.',
        },
      },
      {
        id: 'aseo-2',
        minutes: 8,
        title: { es: 'Parar', en: 'Stop', nah: 'Xikahua' },
        body: {
          es: 'Si hay dolor, frío o miedo, paras, cubres a la persona y pides apoyo. El piso mojado se seca antes de caminar. No anotes datos de salud en la app.',
          en: 'If there is pain, cold, or fear, stop, cover the person, and ask for help. Dry a wet floor before walking. Do not enter health data in the app.',
          nah: 'Tla tekokoa, xikahua. En español: paras, cubres y pides apoyo. Seca el piso mojado.',
        },
      },
    ],
  },
  {
    id: 'jerga-del-sector-1',
    line: 'tecnica',
    level: 'inicial',
    minutes: 15,
    title: {
      es: 'Jerga del sector',
      en: 'Words of the care sector',
      nah: 'Jerga del sector',
    },
    summary: {
      es: 'Palabras del turno, en claro: relevo, nodo, apoyo. Si no entiendes una, se pregunta.',
      en: 'Shift words, in plain language: respite, node, support. If you do not know one, ask.',
      nah: 'Tlajtoli del turno. Tla amo tikmati, xiktlajtlani. En español: relevo, nodo y apoyo, y preguntas la que no entiendas.',
    },
    modules: [
      {
        id: 'jer-1',
        minutes: 8,
        title: { es: 'Tres palabras', en: 'Three words', nah: 'Ey tlajtoli' },
        body: {
          es: 'Relevo: alguien cubre un rato para que tú descanses. Nodo: el grupo del barrio que valida las horas. Apoyo: lo que hiciste, por ejemplo comida, aseo o compañía. No son diagnósticos.',
          en: 'Respite: someone covers a while so you can rest. Node: the neighborhood group that validates hours. Support: what you did, such as food, washing, or company. These are not diagnoses.',
          nah: 'Relevo: okse kipalewia. Nodo: in barrio. Apoyo: tlen otikchiu. En español: relevo, nodo y apoyo. No son diagnósticos.',
        },
      },
      {
        id: 'jer-2',
        minutes: 7,
        title: { es: 'La que no entiendes', en: 'The one you do not know', nah: 'Amo tikmati' },
        body: {
          es: 'Si en el turno dicen una palabra que no conoces, preguntas antes de actuar. No inventes el significado ni lo anotes como dato de una persona.',
          en: 'If the shift uses a word you do not know, ask before you act. Do not invent the meaning or write it down as a fact about a person.',
          nah: 'Xiktlajtlani achto. En español: preguntas antes de actuar. No inventes lo que significa.',
        },
      },
    ],
  },
  {
    id: 'alfabetizacion-digital-1',
    line: 'digital',
    level: 'inicial',
    minutes: 15,
    title: {
      es: 'Alfabetización digital',
      en: 'Digital literacy',
      nah: 'Alfabetización digital',
    },
    summary: {
      es: 'Botones que caben en el dedo, y claves que no se mandan por mensaje.',
      en: 'Buttons that fit a finger, and passwords you do not send in a message.',
      nah: 'Botones para un dedo. Amo xiktemaka moklave por mensaje. En español: la clave no se manda por chat.',
    },
    modules: [
      {
        id: 'alf-1',
        minutes: 8,
        title: { es: 'Dedo y letra', en: 'Finger and type', nah: 'Dedo' },
        body: {
          es: 'Un control usable se toca con un dedo, sin puntería fina, y se lee sin letra diminuta. Si no cabe, no es para este momento. Sube el tamaño de letra en el teléfono.',
          en: 'A usable control is tapped with one finger, without fine aim, and read without tiny type. If it does not fit, it is not for this moment. Increase the phone text size.',
          nah: 'Se botón kipia in dedo. En español: se toca con un dedo y la letra se lee. Súbela en ajustes.',
        },
      },
      {
        id: 'alf-2',
        minutes: 7,
        title: { es: 'La clave', en: 'The password', nah: 'Klave' },
        body: {
          es: 'Nadie del nodo te pide la clave por mensaje. Si una página lo hace, ciérrala y pregunta en persona. El canje de Puntos Cívicos no pide tarjeta ni clave de otro sitio.',
          en: 'Nobody at the node asks for your password in a message. If a page does, close it and ask in person. Redeeming Civic Points does not ask for a card or another site’s password.',
          nah: 'Amo xiktemaka moklave. En español: cierras la página y preguntas en el nodo. El canje no pide tarjeta.',
        },
      },
    ],
  },
]

export function coursesFor(maxMinutes?: number): Course[] {
  if (maxMinutes === undefined) return COURSES
  return COURSES.filter((course) => course.minutes <= maxMinutes)
}

export function courseById(id: string): Course | undefined {
  return COURSES.find((course) => course.id === id)
}

export function textOf(text: Text, lang: Lang): string {
  return text[lang]
}
