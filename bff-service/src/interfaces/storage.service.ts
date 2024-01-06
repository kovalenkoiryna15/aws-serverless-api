export interface StorageService {
  get<D>(key: string): D;
  set<D>(key: string, data: D): void;
  delete(key: string): void;
  clear(): void;
}
