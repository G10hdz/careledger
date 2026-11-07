import type { BeneficiaryCategory, SelfCareType, SupportType } from '@careledger/domain'
import { MAX_MINUTES, MIN_MINUTES } from './config'

export const REGISTER_STEPS = [1, 2, 3] as const

export const TIME_PRESETS = [
  { id: '1h', minutes: 60 },
  { id: '2h30', minutes: 150 },
  { id: '3h30', minutes: 210 },
  { id: '5h', minutes: 300 },
] as const

export interface WizardState {
  step: 1 | 2 | 3
  kind: 'cuidado' | 'autocuidado'
  category: BeneficiaryCategory | null
  selfCareType: SelfCareType | null
  minutes: number
  supportTypes: SupportType[]
}

export type WizardEvent =
  | { type: 'pick-category'; category: BeneficiaryCategory }
  | { type: 'pick-self'; selfCareType: SelfCareType }
  | { type: 'set-minutes'; minutes: number }
  | { type: 'toggle-support'; support: SupportType }
  | { type: 'next' }
  | { type: 'back' }

export function initialWizard(kind: WizardState['kind']): WizardState {
  return {
    step: 1,
    kind,
    category: null,
    selfCareType: null,
    minutes: 210,
    supportTypes: [],
  }
}

export function clampMinutes(minutes: number): number {
  return Math.min(MAX_MINUTES, Math.max(0, minutes))
}

function selectionReady(state: WizardState): boolean {
  if (state.kind === 'cuidado') return state.category !== null
  return state.selfCareType !== null
}

export function canContinue(state: WizardState): boolean {
  if (state.step === 1) return selectionReady(state)
  if (state.step === 2) {
    return state.minutes >= MIN_MINUTES && (state.kind === 'autocuidado' || state.supportTypes.length > 0)
  }
  return false
}

export function canSign(state: WizardState): boolean {
  return (
    state.step === 3 &&
    state.minutes >= MIN_MINUTES &&
    selectionReady(state) &&
    (state.kind === 'autocuidado' || state.supportTypes.length > 0)
  )
}

export function wizard(state: WizardState, event: WizardEvent): WizardState {
  switch (event.type) {
    case 'pick-category':
      return { ...state, category: event.category, step: 2 }
    case 'pick-self':
      return { ...state, selfCareType: event.selfCareType, step: 2 }
    case 'set-minutes':
      return { ...state, minutes: clampMinutes(event.minutes) }
    case 'toggle-support': {
      const has = state.supportTypes.includes(event.support)
      return {
        ...state,
        supportTypes: has
          ? state.supportTypes.filter((item) => item !== event.support)
          : [...state.supportTypes, event.support],
      }
    }
    case 'next':
      if (state.step === 2 && canContinue(state)) return { ...state, step: 3 }
      return state
    case 'back':
      if (state.step === 1) return state
      return { ...state, step: (state.step - 1) as 1 | 2 }
    default:
      return state
  }
}
