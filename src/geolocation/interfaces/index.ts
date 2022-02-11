export interface IDistance {
  from: coordinate;
  to: coordinate;
  distanceInKm: number;
}

export type coordinate = [number, number];
