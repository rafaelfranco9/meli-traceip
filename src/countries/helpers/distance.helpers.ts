import { Coordinates } from 'src/geolocation/types';

export function CalculateCoordenatesDistanceInKm(
  coordinate1: Coordinates,
  coordinate2: Coordinates,
) {
  const EARTH_RADIUS_KM = 6371;

  const latitude1 = degreesToRadians(coordinate1[0]);
  const longitude1 = degreesToRadians(coordinate1[1]);
  const latitude2 = degreesToRadians(coordinate2[0]);
  const longitude2 = degreesToRadians(coordinate2[1]);

  //Haversine formula
  const latitudeDistance = latitude2 - latitude1;
  const longitudeDistance = longitude2 - longitude1;
  const a =
    Math.pow(Math.sin(latitudeDistance / 2), 2) +
    Math.cos(latitude1) *
      Math.cos(latitude2) *
      Math.pow(Math.sin(longitudeDistance / 2), 2);

  const c = 2 * Math.asin(Math.sqrt(a));
  const distance = EARTH_RADIUS_KM * c;

  return +distance.toFixed(0);
}

export function degreesToRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}
