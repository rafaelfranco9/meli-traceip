import { Coordinates } from 'src/geolocation/types';

export class apiResponse {
  readonly name: { common: string };
  readonly cca2: string;
  readonly latlng: Coordinates;
  readonly languages: Record<string, string>;
  readonly currencies: Record<string, { name: string; symbol: string }>;
  readonly timezones: string[];
  readonly translations: Record<string, { common: string }>;
}
