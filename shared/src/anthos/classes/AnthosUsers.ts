import type { Anthos } from './Anthos.ts'

export class AnthosUsers {
  constructor(protected readonly anthos: Anthos) {
    void this.anthos
  }
}
