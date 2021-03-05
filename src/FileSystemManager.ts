import { join } from 'path';
import { readFile as readFileAsync, writeFile, readdir, stat, createFile, mkdir } from 'fs-extra';

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
  constructor(relativePath?: string) {
    super(
      `Path, [${relativePath}],  is empty or contains forbidden characters, :, ?, >, <, or "!!!`,
    );
  }
}

/** Thrown when the path is empty. */
export class PathIsEmptyException extends FileSystemMangerError {
  constructor(relativePath?: string) {
    super(`Path, [${relativePath}], is empty!!!`);
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

  public isPathPointFile: boolean;

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
   * @returns {Promise<void>}
   */
  public async init(): Promise<void> {
    const cpath = this.relativeFilePath;

    if (await FileSystemManager.isFileSoft(cpath)) {
      this.isPathPointFile = true;
      this.content = (await readFileAsync(cpath)).toString();
    } else if (await FileSystemManager.isDirectorySoft(cpath)) {
      this.isPathPointFile = false;
      const dirs = await FileSystemManager.readdirs(cpath);

      for (let dir of dirs) {
        const currentPath = join(cpath, dir);
        const newBranch = new FileSystemManager(currentPath);
        await newBranch.init();
        this.branches.push(newBranch);
      }
    }
    return;
  }

  /**
   * Refactor the current directory three by the new path.
   * Replace placeholder with the value in the file names, folder names, and content
   * @param {string} newDirectoryRelativePath
   * @param {string} placeholder
   * @param {string} value
   * @returns void
   * @throws {PathIsNotValidException}
   * @throws {PathIsEmptyException}
   */
  public refactorTo(
    newDirectoryRelativePath: string,
    placeHolder: string,
    value: string,
    isBranch = false,
  ): void | never {
    this.relativeFilePath = FileSystemManager.resolveRelativePath(newDirectoryRelativePath);
    this.fileName = this.relativeFilePath.split('\\').pop();

    const placeHolderVariations = Object.values(this.textVariations(placeHolder));
    const valueVariations = Object.values(this.textVariations(value));
    const variations = placeHolderVariations.map((p) => [p, valueVariations.shift()]);

    for (let variation of variations) {
      this.content = this.content?.replace(new RegExp(variation[0], 'g'), variation[1]);
      if (isBranch) {
        this.fileName = this.fileName.replace(new RegExp(variation[0], 'g'), variation[1]);
        this.relativeFilePath = this.relativeFilePath.replace(
          new RegExp(variation[0], 'g'),
          variation[1],
        );
      }
    }
    for (let branch of this.branches) {
      branch.refactorTo(join(newDirectoryRelativePath, branch.fileName), placeHolder, value, true);
    }
  }

  public async writeHardFile() {
    if (this.isPathPointFile) {
      await createFile(this.relativeFilePath);
      await writeFile(this.relativeFilePath, this.content);
    } else {
      await mkdir(this.relativeFilePath);
    }
    for (let branch of this.branches) {
      await branch.writeHardFile();
    }
  }

  /**
   * Create variations of the text like UpperCase, LowerCase, PascalCase, CamelCase, SnakeCase
   * @param placeHolder
   * @returns
   */
  private textVariations(placeHolder: string) {
    placeHolder = placeHolder
      .split('')
      .map((e) => (e.charCodeAt(0) >= 65 && e.charCodeAt(0) <= 90 ? '-' + e : e))
      .join('');

    let segments = placeHolder.split('-').map((e) => e.toLowerCase());

    const LowerCaseVariation = segments.join('');
    const UpperCaseVariation = segments.join('_').toUpperCase();
    const PascalCaseVariation = segments
      .map((e) => e[0].toUpperCase() + e.slice(1, e.length))
      .join('');
    const CamelCaseVariation =
      PascalCaseVariation[0].toLowerCase() +
      PascalCaseVariation.slice(1, PascalCaseVariation.length);
    const SnakeCaseVariation = segments.join('_');

    return {
      UpperCaseVariation,
      LowerCaseVariation,
      PascalCaseVariation,
      CamelCaseVariation,
      SnakeCaseVariation,
    };
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
    if (this.isRelativePathValid(relativePath)) {
      return join('', relativePath);
    }
  }

  /**
   * Relative path must NOT be empty and Not contains any item in the list [ '?', '<', '>', '"' , ":" "]
   * @param {string} path  relativePath
   * @returns {true}
   * @throws {PathIsNotValidException}
   * @throws {PathIsEmptyException}
   */
  static isRelativePathValid(relativePath: string): true | never {
    if (relativePath == undefined) {
      throw new PathIsEmptyException(undefined);
    }
    if (relativePath == '') {
      throw new PathIsEmptyException(relativePath);
    }
    if (relativePath.match(new RegExp(/[\?|<|>|"|:]/))) {
      throw new PathIsNotValidException(relativePath);
    }
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
   * @returns {Promise<boolean>}
   * @param {string} relativePath
   */
  static async isFileSoft(relativePath: string): Promise<boolean> {
    try {
      return await this.isFile(relativePath);
    } catch (err) {
      return false;
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
   * @returns {Promise<boolean>}
   * @param {string} relativePath
   */
  static async isDirectorySoft(relativePath: string): Promise<boolean> {
    try {
      return await this.isDirectory(relativePath);
    } catch (err) {
      return false;
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
    if (await this.isDirectory(relativePath)) {
      return await readdir(this.resolveRelativePath(relativePath));
    }
  }

  public print() {
    console.log({
      content: this.content,
      fileName: this.fileName,
      relativeFilePath: this.relativeFilePath,
      branches: this.branches.map((e) => e.relativeFilePath),
    });
    this.branches.map((e) => e.print());
  }

  public toString(): string {
    return JSON.stringify({
      content: this.content,
      fileName: this.fileName,
      relativeFilePath: this.relativeFilePath,
      branches: this.branches.map((e) => e.toString()),
    });
  }
}
