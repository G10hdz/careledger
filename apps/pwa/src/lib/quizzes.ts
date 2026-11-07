import type { Lang } from './langs'

type Text = Record<Lang, string>

export interface QuizQuestion {
  id: string
  prompt: Text
  options: Text[]
  correct: number
}

function t(es: string, en: string, nah: string): Text {
  return { es, en, nah }
}

function q(id: string, prompt: Text, options: Text[], correct: number): QuizQuestion {
  return { id, prompt, options, correct }
}

/** Clave determinística, versionada con el curso. Se califica en el teléfono. */
export const QUIZZES: Record<string, QuizQuestion[]> = {
  movilizacion: [
    q(
      'mov-q1',
      t('¿Cómo ayudas a alguien a levantarse?', 'How do you help someone stand?', '¿Kenin tikpalehuia ma mewa?'),
      [
        t('Con la espalda recta y lejos de la persona', 'With a straight back, standing far away', 'Ika motlankuayo, uejka'),
        t('Cerca, con las rodillas flexionadas', 'Close, with bent knees', 'Nekan, motlancuatzin'),
        t('De un jalón, aunque diga que le duele', 'With a yank, even if they say it hurts', 'Ika se jalón, maski tekokoa'),
      ],
      1,
    ),
    q(
      'mov-q2',
      t('Si hay mareo o miedo, ¿qué haces?', 'If there is dizziness or fear, what do you do?', 'Tla momamauhtia, ¿tlen tikchiua?'),
      [
        t('Paras y pides apoyo', 'You stop and ask for help', 'Xikahua uan xiktemo palehuiliztli'),
        t('Sigues para terminar rápido', 'You continue to finish fast', 'Xiktopea'),
      ],
      0,
    ),
  ],
  signos: [
    q(
      'sig-q1',
      t('Observar la respiración y la piel es…', 'Noticing breathing and skin is…', 'Tikita ijiiotl uan nakayotl…'),
      [
        t('Un diagnóstico que se guarda en la app', 'A diagnosis stored in the app', 'Se diagnóstico en la app'),
        t('Una observación. No se anota aquí', 'A notice. It is not written here', 'Se observación. Amo se anota'),
      ],
      1,
    ),
    q(
      'sig-q2',
      t('Si cuesta despertar, duele el pecho o falta el aire…', 'If waking is hard, the chest hurts, or breath is short…', 'Tla amo ueltzin ijiiotl…'),
      [
        t('Esperas al otro día', 'You wait until the next day', 'Xikchiya mostla'),
        t('Lo anotas como expediente', 'You file it as a medical record', 'Xikijkuilo expediente'),
        t('Buscas ayuda de salud en ese momento', 'You get health help right then', 'Xiktemo palehuiliztli de salud'),
      ],
      2,
    ),
  ],
  medicacion: [
    q(
      'med-q1',
      t('Si la toma ya se dio, ¿qué sigue?', 'If the dose was already given, what next?', 'Tla ya oniktemakak, ¿tlen?'),
      [
        t('Otra, por si acaso', 'Another one, just in case', 'Oksepa, por si acaso'),
        t('No repites. Lees el envase', 'You do not repeat it. You read the label', 'Amo oksepa. Xikita in envase'),
      ],
      1,
    ),
    q(
      'med-q2',
      t('¿Dónde anotas un diagnóstico?', 'Where do you write a diagnosis?', '¿Kanin tikijkuiloa se diagnóstico?'),
      [
        t('En Cuando cuidas, te descuidas', 'In Cuando cuidas, te descuidas', 'Ipan Cuando cuidas, te descuidas'),
        t('No en esta app. Si hay duda, preguntas en el centro o la farmacia', 'Not in this app. If unsure, ask the clinic or pharmacy', 'Amo nikan. Xiktlajtlani en el centro'),
      ],
      1,
    ),
  ],
  telefono: [
    q(
      'tel-q1',
      t('Para ver mejor la pantalla…', 'To see the screen more clearly…', 'Para tikita kualtzin…'),
      [
        t('Subes el tamaño de letra en ajustes', 'You increase the text size in settings', 'Xikueyilia in tlakuilolli'),
        t('Acercas la cara hasta que duela', 'You bring your face close until it hurts', 'Ximonechka hasta tekokoa'),
      ],
      0,
    ),
    q(
      'tel-q2',
      t('Si se corta el internet al registrar…', 'If the internet drops while you record…', 'Tla amo onka red…'),
      [
        t('Lo escribes otra vez desde cero', 'You type it all again', 'Oksepa desde cero'),
        t('Se queda en el teléfono y se manda solo al volver la señal', 'It stays on the phone and sends when the signal returns', 'Mokahua en el teléfono'),
      ],
      1,
    ),
  ],
  tramites: [
    q(
      'tra-q1',
      t('Tu clave de otro sitio…', 'Your password for another site…', 'Moklave de otro sitio…'),
      [
        t('Se dicta por mensaje si lo piden', 'You read it in a message if they ask', 'Xiktemaka por mensaje'),
        t('No se manda por chat. Cuando cuidas, te descuidas no la pide', 'You do not send it in chat. Cuando cuidas, te descuidas does not ask for it', 'Amo por chat. Cuando cuidas, te descuidas amo kitlajtlanilia'),
      ],
      1,
    ),
    q(
      'tra-q2',
      t('Un pago que nadie te anunció…', 'A payment nobody told you about…', 'Se pago amo onimitzili…'),
      [
        t('Cierras y preguntas en el nodo. El canje no pide tarjeta', 'You close it and ask at the node. Redeeming does not ask for a card', 'Xiktzakua. El canje amo kitlajtlanilia tarjeta'),
        t('Pagas para no perder el turno', 'You pay so you do not lose your turn', 'Xikxtlaua'),
      ],
      0,
    ),
  ],
  'cuidado-infancias-1': [
    q(
      'inf-q1',
      t('Con una infancia a tu cargo, lo primero es…', 'With a child in your care, the first thing is…', 'Ika se konetl…'),
      [
        t('Dejarla en el cuarto mientras haces otra cosa', 'Leave them in the room while you do something else', 'Xikkahua en el cuarto'),
        t('Tenerla a la vista y cerca de ti', 'Keep them in sight and close to you', 'Xikita uan xikpia nekan'),
      ],
      1,
    ),
    q(
      'inf-q2',
      t('Si algo se sale de lo cotidiano (no despierta, se pega, le falta el aire)…', 'If something is out of the ordinary (will not wake, a hard fall, cannot breathe)…', 'Tla amo kualtzin…'),
      [
        t('Buscas ayuda de salud y no lo anotas como expediente aquí', 'You get health help and do not file it here', 'Xiktemo palehuiliztli. Amo expediente nikan'),
        t('Esperas a ver si se le pasa solo', 'You wait to see if it passes', 'Xikchiya'),
      ],
      0,
    ),
  ],
  'aseo-bano-paciente-1': [
    q(
      'aseo-q1',
      t('Antes del agua, revisas…', 'Before the water, you check…', 'Achto atl, tikita…'),
      [
        t('Que no queme ni esté helada, y que la persona tenga privacidad', 'That it is not burning or freezing, and that the person has privacy', 'Amo totonki, amo setik, uan privacidad'),
        t('Solo que haya prisa por terminar', 'Only that you can finish in a hurry', 'Solo prisa'),
      ],
      0,
    ),
    q(
      'aseo-q2',
      t('Si dice que le duele o tiene miedo…', 'If they say it hurts or they are afraid…', 'Tla tekokoa noso momamauhtia…'),
      [
        t('Sigues porque el aseo no puede esperar', 'You continue because washing cannot wait', 'Xiktopea'),
        t('Paras, lo cubres y pides apoyo', 'You stop, cover them, and ask for help', 'Xikahua, xiktlapacho, xiktemo palehuiliztli'),
      ],
      1,
    ),
  ],
  'jerga-del-sector-1': [
    q(
      'jer-q1',
      t('Una palabra del turno que no entiendes…', 'A word from the shift that you do not understand…', 'Se tlajtoli amo tikmati…'),
      [
        t('La preguntas. No inventas lo que significa', 'You ask. You do not invent the meaning', 'Xiktlajtlani. Amo xikinventa'),
        t('Asumes y sigues', 'You assume and carry on', 'Xikneltoka uan xiktopea'),
      ],
      0,
    ),
    q(
      'jer-q2',
      t('“Relevo” en este nodo quiere decir…', '“Respite cover” at this node means…', '“Relevo” nikan…'),
      [
        t('Un diagnóstico', 'A diagnosis', 'Se diagnóstico'),
        t('Que otra persona cubre un rato para que tú descanses', 'That someone else covers a while so you can rest', 'Okse kipalewia para timosiyajkana'),
      ],
      1,
    ),
  ],
  'alfabetizacion-digital-1': [
    q(
      'alf-q1',
      t('Un botón usable con una mano…', 'A button you can use with one hand…', 'Se botón ika se mayotl…'),
      [
        t('Cabe en el dedo y se entiende sin letra diminuta', 'Fits a finger and is clear without tiny type', 'Kipia in dedo uan amo letra chikitik'),
        t('Está escondido en un menú de tres puntos', 'Is hidden in a three-dot menu', 'Motlatia'),
      ],
      0,
    ),
    q(
      'alf-q2',
      t('Una página te pide la clave por mensaje…', 'A page asks for your password in a message…', 'Se página kitlajtlanilia moklave por mensaje…'),
      [
        t('La mandas para no perder el trámite', 'You send it so you do not lose the procedure', 'Xiktemaka'),
        t('No la mandas. Cierras y preguntas en el nodo', 'You do not send it. You close it and ask at the node', 'Amo. Xiktzakua uan xiktlajtlani en el nodo'),
      ],
      1,
    ),
  ],
}

export function gradeQuiz(courseId: string, answers: readonly number[]): boolean {
  const quiz = QUIZZES[courseId]
  if (!quiz || quiz.length === 0 || answers.length !== quiz.length) return false
  return quiz.every((question, index) => answers[index] === question.correct)
}
