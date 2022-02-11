import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CurrenciesService } from './currencies.service';

@Module({
  imports:[HttpModule],
  providers: [CurrenciesService],
  exports:[CurrenciesService]
})
export class CurrenciesModule {}
