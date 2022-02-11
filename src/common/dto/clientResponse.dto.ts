import {
  CalculateDistanceInKm,
  formatDateTime,
} from 'src/countries/helpers/countries.helpers';
import { ICountry } from 'src/countries/interfaces';
import { coordinate, IDistance } from 'src/geolocation/interfaces';

export class ClientResponseDto {
  public ip: string;
  public date: string;
  public country: ICountry;
  public distance: IDistance;
  constructor(ip: string, country: ICountry, originCoordinates: coordinate) {
    this.ip = ip;
    this.date = formatDateTime(new Date());
    this.country = { ...country };
    this.distance = {
      from: originCoordinates,
      to: country.coordinates,
      distanceInKm: CalculateDistanceInKm(originCoordinates, country.coordinates),
    };
  }
}
