// types/index.ts
export interface UserData {
  name: string
  mbti: string
  scene: string
  wish: string
  score: string
}

export interface WizardProfile {
  house: string
  wand: string
  patronus: string
  spell: string
  mentorMessage: string
}

export const houses = ['Gryffindor', 'Hufflepuff', 'Ravenclaw', 'Slytherin'] as const
export type House = (typeof houses)[number]
