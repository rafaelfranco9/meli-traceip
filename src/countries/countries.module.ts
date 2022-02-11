import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CurrenciesModule } from 'src/currencies/currencies.module';
import { CountriesService } from './countries.service';

@Module({
  imports:[HttpModule,CurrenciesModule],
  providers: [CountriesService],
  exports:[CountriesService]
})
export class CountriesModule {}
