/**
 * Future: OCR for searchable PDFs.
 * Hook point for extracting text from screenshots before export.
 */
export interface OcrProvider {
  recognize(image: Blob): Promise<string>;
}

/**
 * Future: cloud storage for study packs.
 */
export interface CloudSyncProvider {
  savePack(files: File[]): Promise<string>;
}

/**
 * Future: MeraIPU account and saved study packs.
 */
export interface AccountProvider {
  signIn(): Promise<void>;
}

/**
 * Future: duplicate screenshot detection.
 */
export interface DuplicateDetector {
  findDuplicates(ids: string[]): Promise<string[][]>;
}
