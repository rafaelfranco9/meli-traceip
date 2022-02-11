import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { GeolocationModule } from './geolocation/geolocation.module';
import { CountriesModule } from './countries/countries.module';
import { CurrenciesModule } from './currencies/currencies.module';
import { StatisticsModule } from './statistics/statistics.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    EventEmitterModule.forRoot({ global: true }),
    CacheModule.register({ ttl: 0 }),
    GeolocationModule,
    CountriesModule,
    CurrenciesModule,
    StatisticsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
