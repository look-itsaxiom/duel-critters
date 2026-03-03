import { customAlphabet } from 'nanoid'
import { CRITTER_ID_PREFIX, ID_LENGTH } from './constants'

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const generate = customAlphabet(alphabet, ID_LENGTH)

export function generateCritterId(): string {
  return `${CRITTER_ID_PREFIX}-${generate()}`
}
