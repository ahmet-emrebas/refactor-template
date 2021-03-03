import { join } from 'path';

// Exceptions

/** Thrown when path is NOT valid. */
export class PathIsNotValidException extends Error {
  constructor() {
    super('Path is empty or contains forbidden characters, :, ?, >, <, or "!!!');
  }
  static toString() {
    return PathIsNotValidException.name;
  }
}

/** Thrown when the path is empty. */
export class PathIsEmptyException extends Error {
  constructor() {
    super('Path is empty!!!');
  }
  static toString() {
    return PathIsEmptyException.name;
  }
}

export class FileTreeRefactor {
  /**
   * Directory to be process.
   * @example users, products, products-one etc.
   * @type string
   */
  private readonly workingRelativePath: string;

  /**
   * Relative path to the directory.
   * @example src/users, src/products, src/products/products-one
   * @type string
   */
  private readonly directoryRelativePath: string;

  /**
   * List of FileTreeRefactor, representing folders and files.
   * @types FileTreeRefactor[]
   */
  private branches: FileTreeRefactor[] = [];

  /**
   * @param {string} directoryRelativePath Relative path to the directory. Ex. src/users, src/products, src/products/products-one.
   */
  constructor(directoryRelativePath: string) {
    this.directoryRelativePath = directoryRelativePath;
  }

  /**
   * Refactor the current directory three to new one.
   * To generate a new folder from the configuration of this instance with a different directory path newDirectoryRelativePath.
   * @param {string} newDirectoryRelativePath
   * @returns void
   * @throws PathIsNotValidException, PathIsEmptyException.
   */
  public refactorTo(newDirectoryRelativePath: string) {
    FileTreeRefactor.isRelativePathValid(newDirectoryRelativePath);
    throw new Error('Not Implmented!');
  }

  /**
   * Parse the workingRelative path from the relative path.
   * @example parserWorkingRelativePath('src/users') will return 'users'.
   * @param relativePath
   * @returns string
   * @throws PathIsNotValidException, PathIsEmptyException.
   */
  static parseWorkingRelativePath(relativePath: string) {
    return this.resolveRelativePath(relativePath).split('\\').pop();
  }

  /**
   * Resolve relative path as nodejs path.
   * @param relativePath
   * @example resolveRelativePat('src/users') return 'src\users'.
   * @returns string
   * @throws PathIsNotValidException, PathIsEmptyException.
   */
  static resolveRelativePath(relativePath: string) {
    this.isRelativePathValid(relativePath);
    return join('', relativePath);
  }

  /**
   * Relative path must NOT be empty and Not contains any item in the list [ '?', '<', '>', '"' , ":" "]
   * @param path {string} relativePath
   * @returns true
   * @throws PathIsNotValidException, PathIsEmptyException
   */
  static isRelativePathValid(relativePath: string) {
    if (relativePath === '' || !relativePath) throw new PathIsEmptyException();
    if (relativePath.match(new RegExp(/[?|<|>|"|:]/))) throw new PathIsNotValidException();
    return true;
  }
}
