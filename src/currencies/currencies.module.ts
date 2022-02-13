import { HttpModule } from '@nestjs/axios';
import { CacheModule, Module } from '@nestjs/common';
import { CurrenciesService } from './currencies.service';

@Module({
  imports: [HttpModule, CacheModule.register({ ttl: 60 * 60 })],
  providers: [CurrenciesService],
  exports: [CurrenciesService],
})
export class CurrenciesModule {}
