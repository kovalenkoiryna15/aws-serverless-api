import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpService } from './services/http.service';
import { CacheService } from './services/cache.service';
import { MemoryStorageService } from './services/memory-storage.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, HttpService, CacheService, MemoryStorageService],
})
export class AppModule {}
