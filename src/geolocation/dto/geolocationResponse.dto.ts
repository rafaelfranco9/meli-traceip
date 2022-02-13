export class GeolocationResponseDto {
  countryCode: string;
  countryCode3: string;
  countryName: string;
  countryEmoji: string;
  constructor(body: any) {
    this.countryCode = body.countryCode;
    this.countryCode3 = body.countryCode3;
    this.countryName = body.countryName;
    this.countryEmoji = body.countryEmoji;
  }
}
