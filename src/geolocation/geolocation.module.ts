import { HttpModule } from '@nestjs/axios';
import { CacheModule, Module } from '@nestjs/common';
import { GeolocationService } from './geolocation.service';

@Module({
  imports: [HttpModule,CacheModule.register({ttl:0})],
  providers: [GeolocationService],
  exports: [GeolocationService],
})
export class GeolocationModule {}
