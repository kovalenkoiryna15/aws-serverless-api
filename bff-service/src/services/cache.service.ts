import { Inject, Injectable } from '@nestjs/common';
import { MemoryStorageService } from './memory-storage.service';
import { StorageService } from '../interfaces/storage.service';
import { CacheData } from '../types/cache.model';

@Injectable()
export class CacheService {
  private readonly defaultCacheTime: number = Number(
    process.env.DEFAULT_CACHE_TIME || 120000,
  ); // 2 minutes

  constructor(
    @Inject(MemoryStorageService)
    private readonly storageService: StorageService,
  ) {}

  get<D>(key: string): D {
    const cache = this.storageService.get<CacheData<D>>(key);

    if (!cache) {
      return null;
    }

    if (this.isExpired(cache.expirationTime)) {
      this.storageService.delete(key);
      return null;
    }

    return cache.data;
  }

  set<D>(key: string, data: D): void {
    const creationTime = Date.now();
    const cache: CacheData<D> = {
      expirationTime: creationTime + this.defaultCacheTime,
      creationTime,
      data,
    };
    this.storageService.set<CacheData<D>>(key, cache);
  }

  private isExpired(expirationTime: number): boolean {
    return Date.now() > expirationTime;
  }
}
