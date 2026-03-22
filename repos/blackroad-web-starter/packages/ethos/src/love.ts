export interface LoveWeights {
  user: number;
  team: number;
  world: number;
}

export const defaultLoveWeights: LoveWeights = {
  user: 0.45,
  team: 0.25,
  world: 0.30,
};

export default defaultLoveWeights;
