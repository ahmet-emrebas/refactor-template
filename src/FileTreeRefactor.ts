import { join } from 'path';

// Exceptions

export class PathIsNotValidException extends Error {
  constructor() {
    super('Path is empty or contains forbidden characters, :, ?, >, <, or "');
  }
  static throw() {
    throw new PathIsNotValidException();
  }
}

// Class

export class FileTreeRefactor {
  private workingRelativePath: string;

  /**
   * @param directoryRelativePath Ex. src/users, src/services/product-service
   * @param workingRelativePath Ex users, product-service
   */
  constructor(private directoryRelativePath: string) {}

  /**
   * Resolve backslash problem.
   * @example input: src/users, output: src\\users.
   * @param fileRelativePath Ex. src/users, src/service
   */
  static resolveRelativePath(fileRelativePath: string) {
    this.isRelativePathValid(fileRelativePath);
    return join('', fileRelativePath);
  }

  /**
   * Relative path must NOT be empty and Not contains any item in the list [ '?', '<', '>', '"' , ":" "]
   * @param path {string} relativePath
   * @returns true
   * @throws PathIsNotValidException
   */
  static isRelativePathValid(relativePath: string) {
    if (relativePath == '' || relativePath.match(new RegExp(/[?|<|>|"|:]/))) {
      throw new PathIsNotValidException();
    }
    return true;
  }
}
