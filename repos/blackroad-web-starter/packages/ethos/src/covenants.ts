export const covenants = [
  "tell_the_truth",
  "no_exploitation",
  "try_your_best",
  "care_for_community_self_environment",
  "love_operator",
] as const;

export type Covenant = (typeof covenants)[number];
