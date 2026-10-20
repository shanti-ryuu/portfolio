export type CredlyBadge = {
  id: string
  name: string
  issuer: string
  earnedAt: string | null
}

// Add only badges confirmed on the Credly profile.
export const credlyBadges: CredlyBadge[] = []
