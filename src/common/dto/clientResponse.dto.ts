import { ICountry } from 'src/countries/interfaces';
import { IDistance } from 'src/geolocation/interfaces';
export class ClientResponseDto {
  public ip: string;
  public date: string;
  public country: ICountry;
  public distance: IDistance;
  constructor(ip: string, country: ICountry, distance: IDistance) {
    this.ip = ip;
    this.date = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
    this.country = country;
    this.distance = distance;
  }
}
