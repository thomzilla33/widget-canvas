import { AUTOMOTIVE_MODEL } from './automotive.js'

export const AVAILABLE_MODELS = [AUTOMOTIVE_MODEL]

export function modelById(id) {
  return AVAILABLE_MODELS.find((m) => m.id === id) || null
}
