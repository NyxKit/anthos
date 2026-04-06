export class PairingWindowService {
  private openedAt: number | null = null
  private readonly windowMs = 5 * 60 * 1000 // 5 minutes

  open(): void {
    this.openedAt = Date.now()
  }

  isOpen(): boolean {
    return this.openedAt !== null && Date.now() < this.openedAt + this.windowMs
  }

  getStatus(): { isOpen: boolean; expiresAt: number | null } {
    return {
      isOpen: this.isOpen(),
      expiresAt: this.openedAt ? this.openedAt + this.windowMs : null,
    }
  }
}
