import badges from './credly.generated.json'

export type CredlyBadge = { id: string; name: string; issuer: string; issued_at_date: string | null; url: string }
export const credlyBadges = badges as CredlyBadge[]
