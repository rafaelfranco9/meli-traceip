export interface ICountryStatistics {
  name: string;
  requests: number;
  distanceInKm: number;
}
export interface IStatisticsDto {
  maxDistance: ICountryStatistics;
  minDistance: ICountryStatistics;
  averageDistanceInKm: number;
}
