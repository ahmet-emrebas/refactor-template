import { cwd } from 'process';
import { join, relative } from 'path';
import { createFile, readdir, readFile, writeFile } from 'fs-extra';
import { isFile, toCamelCase } from './util';
import { Logger } from './logger';

export class FileTree {
  private fileName: string;
  private absolutePath: string;
  private branches: FileTree[] = [];
  private content: string = '';
  private rootDir: string | null = null;
  /**
   *
   * @param relativePath
   * @param rootDir
   */
  constructor(private relativePath: string, isRootDir?: boolean) {
    // Resolving relative path
    this.relativePath = join('', this.relativePath);
    const arr = this.relativePath.split(/\\/);
    // Getting the folder/file name.
    this.fileName = arr.pop();
    // If it is rootDir, set the rootDir fileName.
    if (isRootDir) {
      this.rootDir = this.fileName;
      Logger.error(arr.toString(), 'FileTree');
    }
  }

  async init() {
    Logger.info('Initializing the context', 'Refactor');
    this.absolutePath = join(cwd(), this.relativePath);
    if (await isFile(this.relativePath)) {
      this.content = (await readFile(this.absolutePath)).toString();
      return;
    }

    for (let dir of await readdir(this.absolutePath))
      this.branches.push(new FileTree(join(this.relativePath, dir)));

    for (let branch of this.branches) await branch.init();

    Logger.info('Successfully initialized the context', 'Refactor');
    return this;
  }

  toString() {
    return `\n
        fileName: ${this.fileName}
        absolutePath:${this.absolutePath}
        relativePath: ${this.relativePath}
        branches: ${this.branches.map((e) => e.toString()).toString()}, 
        content : ${this.content.slice(0, 20) + '...'}
        `;
  }

  /**
   * Refactor the three using the new fileName.
   * @param fileName  File or folder name
   */
  refactorTo(fileName: string, rootDirParam?: string) {
    Logger.info(`Refactoring to ${fileName}.`, 'Refactor');
    if (this.rootDir) {
      this.relativePath = this.relativePath.replace(this.fileName, fileName);
      this.absolutePath = this.absolutePath.replace(this.fileName, fileName);
      this.replaceContent(fileName, this.rootDir);

      for (let branch of this.branches) {
        branch.refactorTo(fileName, this.rootDir);
      }
      this.fileName = fileName;
    } else {
      if (rootDirParam) {
        this.fileName = this.fileName.replace(rootDirParam, fileName);
        this.relativePath = this.relativePath.replace(new RegExp(rootDirParam, 'g'), fileName);
        this.absolutePath = this.absolutePath.replace(new RegExp(rootDirParam, 'g'), fileName);

        this.replaceContent(fileName, rootDirParam);

        for (let branch of this.branches) {
          branch.refactorTo(fileName, rootDirParam);
        }
      }
    }
    Logger.info(`Successfully refactored to ${fileName}`, 'Refactor');
    return this;
  }

  private replaceContent(newValue: string, placeHolder: string) {
    this.content = this.content.replace(
      new RegExp(toCamelCase(placeHolder), 'ig'),
      toCamelCase(newValue),
    );
  }

  public async writeToFiles() {
    Logger.info(`Started writing files`, 'Refactor');
    if (this.content.length > 0) {
      Logger.info(`Writing file ${this.absolutePath}`, 'Refactor');
      await createFile(this.absolutePath);
      await writeFile(this.absolutePath, this.content);
    }
    for (let branch of this.branches) {
      await branch.writeToFiles();
    }
  }
}
