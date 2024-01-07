import { Injectable } from '@nestjs/common';
import { StorageService } from '../interfaces/storage.service';

@Injectable()
export class MemoryStorageService implements StorageService {
  private memory = new Map();

  get<D>(key: string): D {
    if (this.memory.has(key)) {
      return this.memory.get(key);
    }

    return null;
  }

  set<D>(key: string, data: D): void {
    this.memory.set(key, data);
  }

  delete(key: string): void {
    this.memory.delete(key);
  }

  clear(): void {
    this.memory.clear();
  }
}
