export type CacheData<D = any> = {
  expirationTime: number;
  creationTime: number;
  data: D;
};
