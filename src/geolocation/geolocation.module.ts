import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { GeolocationService } from './geolocation.service';

@Module({
  imports: [HttpModule],
  providers: [GeolocationService],
  exports: [GeolocationService],
})
export class GeolocationModule {}
