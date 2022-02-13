import { HttpModule } from '@nestjs/axios';
import { CacheModule, Module } from '@nestjs/common';
import { CurrenciesModule } from 'src/currencies/currencies.module';
import { CountriesService } from './countries.service';

@Module({
  imports: [HttpModule, CurrenciesModule, CacheModule.register({ ttl: 0 })],
  providers: [CountriesService],
  exports: [CountriesService],
})
export class CountriesModule {}
