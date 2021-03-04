import { join } from 'path';
import { readFile, writeFile, readdir, stat } from 'fs-extra';
import { cwd } from 'node:process';
import { relative, resolve } from 'node:path';
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

/** Thrown when there is No under the specified path. */
export class NoSuchADirectory extends FileSystemMangerError {
  constructor() {
    super('There is No directory under the specified path.');
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
   * File Name.
   * @example user.model.ts
   * @type string
   */
  public fileName: string;

  /**
   * List of FileSystemManager, representing folders and files.
   * @types FileSystemManager[]
   */
  public branches: FileSystemManager[] = [];

  /**
   * @param {string} directoryRelativePath Relative path to the directory. Ex. src/users, src/products, src/products/products-one.
   */
  constructor(public relativeFilePath: string, public content?: string) {
    this.relativeFilePath = FileSystemManager.resolveRelativePath(this.relativeFilePath);
    this.fileName = this.relativeFilePath.split('\\').pop();
  }

  /** Read directories, files, and store content and relative directories. */
  public init() {}

  /**
   * Refactor the current directory three to new one.
   * To generate a new folder from the configuration of this instance with a different directory path newDirectoryRelativePath.
   * @param {string} newDirectoryRelativePath
   * @returns void
   * @throws PathIsNotValidException, PathIsEmptyException.
   */
  public refactorTo(newDirectoryRelativePath: string) {
    this.relativeFilePath = FileSystemManager.resolveRelativePath(newDirectoryRelativePath);
    this.fileName = this.relativeFilePath.split('\\').pop();
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
    if (relativePath.match(new RegExp(/[\?|<|>|"|:]/))) throw new PathIsNotValidException();
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
   * Check the relativePath pointing at a directory or not.
   * @param relativePath
   */
  static async isDirectory(relativePath: string): Promise<boolean> {
    this.isRelativePathValid(relativePath);
    try {
      return (await stat(relativePath)).isDirectory();
    } catch (err) {
      throw new NoSuchADirectory();
    }
  }

  /**
   *
   * @param relativePath
   */
  static async readdirs(relativePath: string): Promise<string[]> | never {
    this.isDirectory(relativePath);
    return await readdir(this.resolveRelativePath(relativePath));
  }

  static async writeFile(relativePath: string, content: string): Promise<true> | never {
    this.isFile(relativePath);
    try {
      await writeFile(relativePath, content);
      return true;
    } catch (err) {
      throw err;
    }
  }

  static async clearFile(relativePath: string) {
    FileSystemManager.isFile(relativePath);
    await writeFile(relativePath, '');
  }

  static async readFile(relativePath: string): Promise<string> {
    return (await readFile(relativePath)).toString();
  }
}
