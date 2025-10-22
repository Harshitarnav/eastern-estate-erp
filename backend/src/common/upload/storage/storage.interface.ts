export interface IStorageService {
  save(file: Express.Multer.File, path: string): Promise<string>;
  delete(path: string): Promise<void>;
  getUrl(path: string): string;
  exists(path: string): Promise<boolean>;
}
