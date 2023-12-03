export const BUCKET_NAME: string = 'rss-import-service-bucket';
export const BUCKET_ARN: string = 'arn:aws:s3:::rss-import-service-bucket';

export enum Folders {
  UPLOADED = 'uploaded',
  PARSED = 'parsed',
}
