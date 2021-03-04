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
   * If this is root,
   * @example user.model.ts
   * @type string
   */
  public fileName: string;

  /**
   * List of FileSystemManager
   * @types FileSystemManager[]
   */
  public branches: FileSystemManager[] = [];

  /**
   * @param {string} directoryRelativePath  Relative path to the directory. Ex. src/users, src/products, src/products/products-one.
   * @param {string} content file content
   * @throws {PathIsNotValidException}
   * @throws {PathIsEmptyException}
   */
  constructor(public relativeFilePath: string, public content?: string) {
    this.relativeFilePath = FileSystemManager.resolveRelativePath(this.relativeFilePath);
    this.fileName = this.relativeFilePath.split('\\').pop();
  }

  /**
   * @returns {Promise<FileSystemManager>}
   */
  public async init(): Promise<FileSystemManager> {
    if (await FileSystemManager.isFile(this.relativeFilePath)) {
      this.content = (await readFile(this.relativeFilePath)).toString();
    } else if (await FileSystemManager.isDirectory(this.relativeFilePath)) {
      const dirs = await readdir(this.relativeFilePath);
      for (let dir of dirs) {
        const currentPath = join(this.relativeFilePath, dir);
        if (await FileSystemManager.isFile(currentPath)) {
          const newFile = new FileSystemManager(currentPath);
          newFile.init();
          this.branches.push(newFile);
        } else if (await FileSystemManager.isDirectory(currentPath)) {
          const newDir = new FileSystemManager(currentPath);
          newDir.init();
          this.branches.push(newDir);
        }
      }
    }
    return this;
  }

  /**
   * Refactor the current directory three by the new parameter.
   * @param {string} newDirectoryRelativePath
   * @returns void
   * @throws {PathIsNotValidException}
   * @throws {PathIsEmptyException}
   */
  public refactorTo(newDirectoryRelativePath: string): void | never {
    this.relativeFilePath = FileSystemManager.resolveRelativePath(newDirectoryRelativePath);
    this.fileName = this.relativeFilePath.split('\\').pop();
  }

  /**
   * Parse the workingRelative path from the relative path.
   * @example parserWorkingRelativePath('src/users') will return 'users'.
   * @param {string} relativePath
   * @returns {string}
   * @throws {PathIsNotValidException}.
   * @throws {PathIsEmptyException}.
   */
  static parseWorkingRelativePath(relativePath: string): string | never {
    return this.resolveRelativePath(relativePath).split('\\').pop();
  }

  /**
   * Resolve relative path as nodejs path.
   * @param {string} relativePath
   * @example resolveRelativePat('src/users') return 'src\users'.
   * @returns {string}
   * @throws {PathIsNotValidException}
   * @throws {PathIsEmptyException}
   */
  static resolveRelativePath(relativePath: string): string | never {
    this.isRelativePathValid(relativePath);
    return join('', relativePath);
  }

  /**
   * Relative path must NOT be empty and Not contains any item in the list [ '?', '<', '>', '"' , ":" "]
   * @param {string} path  relativePath
   * @returns {true}
   * @throws {PathIsNotValidException}
   * @throws {PathIsEmptyException}
   */
  static isRelativePathValid(relativePath: string): true | never {
    if (relativePath === '' || !relativePath) throw new PathIsEmptyException();
    if (relativePath.match(new RegExp(/[\?|<|>|"|:]/))) throw new PathIsNotValidException();
    return true;
  }

  /**
   * Check the relativePath pointing at a file or not.
   * @param {string} relativePath
   * @returns {Promise<boolean>}
   * @throws {PathIsNotValidException}
   * @throws {PathIsEmptyException}
   * @throws {NoSuchAFile}
   */
  static async isFile(relativePath: string): Promise<boolean> | never {
    relativePath = this.resolveRelativePath(relativePath);
    try {
      return (await stat(relativePath)).isFile();
    } catch (err) {
      throw new NoSuchAFile();
    }
  }

  /**
   * Check the relativePath pointing at a directory or not.
   * @param {string} relativePath
   * @returns {Promise<boolean>}
   * @throws {PathIsNotValidException}
   * @throws {PathIsEmptyException}
   * @throws {NoSuchADirectory}
   */
  static async isDirectory(relativePath: string): Promise<boolean> | never {
    relativePath = this.resolveRelativePath(relativePath);
    try {
      return (await stat(relativePath)).isDirectory();
    } catch (err) {
      throw new NoSuchADirectory();
    }
  }

  /**
   * Read directives
   * @return {Promise<string[]>} dirs
   * @param {string} relativePath
   * @throws {PathIsNotValidException}
   * @throws {PathIsEmptyException}
   * @throws {NoSuchADirectory}
   */
  static async readdirs(relativePath: string): Promise<string[]> | never {
    this.isDirectory(relativePath);
    return await readdir(this.resolveRelativePath(relativePath));
  }

  /**
   * @param {string} relativePath
   * @param {string} content
   * @throws {PathIsNotValidException}
   * @throws {PathIsEmptyException}
   * @throws {NoSuchAFile}
   */
  async createFileTree(relativePath: string, content: string): Promise<true> | never {
    await FileSystemManager.isFile(relativePath);
    try {
      await writeFile(relativePath, content);
      return true;
    } catch (err) {
      throw err;
    }
  }

  /**
   * clean the content of the file
   * @param {string} relativePath
   * @throws {PathIsNotValidException}
   * @throws {PathIsEmptyException}
   * @throws {NoSuchAFile}
   */
  static async clearFile(relativePath: string) {
    await FileSystemManager.isFile(relativePath);
    await writeFile(relativePath, '');
  }

  toString() {
    return JSON.stringify({
      content: this.content,
      fileName: this.fileName,
      relativeFilePath: this.relativeFilePath,
      branches: this.branches.map(toString),
    });
  }
}
