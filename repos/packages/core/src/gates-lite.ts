import type { GateResult, LicenseTrack, Person, Rulebook } from './types.js'

export function canTradeBDIn(
  state: string,
  context: {
    person: Person
    licenseTracks: LicenseTrack[]
    rulebooks: Rulebook[]
  },
): GateResult {
  const activeTrack = context.licenseTracks.find(
    (track) =>
      track.track === 'securities' &&
      track.stateCode === state &&
      track.status === 'Active',
  )

  if (!activeTrack) {
    return { allowed: false, reason: `No active broker-dealer registration for ${state}` }
  }

  const requiresSponsor =
    context.rulebooks.find(
      (rulebook) =>
        rulebook.stateCode === state &&
        rulebook.track === 'securities' &&
        rulebook.licenseType === activeTrack.licenseType,
    )?.rules.sponsorRequired ?? true

  if (requiresSponsor && !activeTrack.metadata?.sponsorId) {
    return { allowed: false, reason: 'Broker-dealer sponsor is required before trading' }
  }

  return { allowed: true }
}
