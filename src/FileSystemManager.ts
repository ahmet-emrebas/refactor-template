import { join } from 'path';
import { readFile, writeFile, readdir, stat } from 'fs-extra';
import { cwd } from 'node:process';
import { relative } from 'node:path';
import { timeStamp } from 'node:console';

export abstract class FileSystemMangerError extends Error {
  constructor(msg: string) {
    super(msg);
  }

  static toString() {
    return this.name;
  }
}

/** Thrown when there is No under the specified path. */
export class NoSuchAFile extends FileSystemMangerError {
  constructor() {
    super('There is No file under the specified path.');
  }
}

/** Thrown when path is NOT valid. */
export class PathIsNotValidException extends FileSystemMangerError {
  constructor() {
    super('Path is empty or contains forbidden characters, :, ?, >, <, or "!!!');
  }
}

/** Thrown when the path is empty. */
export class PathIsEmptyException extends FileSystemMangerError {
  constructor() {
    super('Path is empty!!!');
  }
}

export class FileSystemManager {
  /**
   * Directory to be processed or fileName.
   * @example users, products, products-one etc.
   * @type string
   */
  private workingRelativePath: string;

  /**
   * Relative path to the directory.
   * @example src/users, src/products, src/products/products-one
   * @type string
   */
  private directoryRelativePath: string;

  /**
   * File content if this instance is a reprentation of a file.
   * @type string
   */
  private content: string = undefined;

  /**
   * List of FileSystemManager, representing folders and files.
   * @types FileSystemManager[]
   */
  private branches: FileSystemManager[] = [];

  /**
   * @param {string} directoryRelativePath Relative path to the directory. Ex. src/users, src/products, src/products/products-one.
   */
  constructor(directoryRelativePath: string) {
    FileSystemManager.isRelativePathValid(directoryRelativePath);
    this.directoryRelativePath = directoryRelativePath;
  }

  /** Read directories, files, and store content and relative directories. */
  public init() {
    FileSystemManager.isFile(this.directoryRelativePath);
  }

  /**
   * Refactor the current directory three to new one.
   * To generate a new folder from the configuration of this instance with a different directory path newDirectoryRelativePath.
   * @param {string} newDirectoryRelativePath
   * @returns void
   * @throws PathIsNotValidException, PathIsEmptyException.
   */
  public refactorTo(newDirectoryRelativePath: string) {
    FileSystemManager.isRelativePathValid(newDirectoryRelativePath);
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

  /**
   * Check the relativePath pointing at a file or not.
   * @param relativePath
   */
  static async isFile(relativePath: string): Promise<boolean> {
    this.isRelativePathValid(relativePath);
    try {
      return (await stat(relativePath)).isFile();
    } catch (err) {
      throw new NoSuchAFile();
    }
  }

  /**
   *
   * @param relativePath
   */
  static async readdirs(relativePath: string): Promise<string[]> | never {
    return await readdir(this.resolveRelativePath(relativePath));
  }

  static writeFile(relativePath: string): Promise<void> {
    throw new Error('Not Implemented');
  }

  static readFile(relativePath: string): Promise<string> {
    throw new Error('Not Implemented');
  }

  static refactorFile(relativePath: string, targetName: string): void {
    throw new Error('Not Implemented');
  }
}
