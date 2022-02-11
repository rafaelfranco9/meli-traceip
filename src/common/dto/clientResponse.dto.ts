import { ICountry } from 'src/countries/interfaces';
import { IDistance } from 'src/geolocation/interfaces';

export class ClientResponseDto {
  public ip: string;
  public date: string;
  public country: ICountry;
  public distance: IDistance;
}
