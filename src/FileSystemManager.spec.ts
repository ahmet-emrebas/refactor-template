import { readFile, readFileSync, writeFile, writeFileSync } from 'fs-extra';
import {
  PathIsEmptyException,
  PathIsNotValidException,
  FileSystemManager,
  NoSuchAFile,
} from './FileSystemManager';

describe('FileSystemManager', () => {
  const instance = new FileSystemManager('testdata');

  it('FileSystemManager should instantiate correctly.', () => {
    const fsm = new FileSystemManager('src/users', 'content');

    expect(fsm.content).toBe('content');
    expect(fsm.fileName).toBe('users');
    expect(fsm.relativeFilePath).toBe('src\\users');
  });

  describe('isRelativePathValid', () => {
    // Valid arguments
    it.each(['src/user', 'src/users/user'])(
      'isRelativePathValid("%s") should RETURN true',
      (input) => {
        expect(FileSystemManager.isRelativePathValid(input)).toBe(true);
      },
    );

    it.each(['src"', 'src?', 'src>', 'src<'])(
      'isRelativePathValid("%s") should THROW PathIsNotValidException',
      (input) => {
        expect(() => FileSystemManager.isRelativePathValid(input)).toThrow(PathIsNotValidException);
      },
    );

    it.each([['', PathIsEmptyException]])(
      'isRelativePathValid(%s) should THROW %s',
      (input, expected) => {
        expect(() => FileSystemManager.isRelativePathValid(input)).toThrow(expected);
      },
    );
  });

  describe('resolveRelativepath', () => {
    it.each([
      ['src', 'src'],
      ['src/users', 'src\\users'],
    ])('resolveRelativePath(%s) should RETURN %s', (input, expected) => {
      expect(FileSystemManager.resolveRelativePath(input)).toBe(expected);
    });

    it.each([
      ['', PathIsEmptyException],
      [':', PathIsNotValidException],
    ])(`resolveRelativePath(%s) should THROW %s`, (input, expected) => {
      expect(() => FileSystemManager.resolveRelativePath(input)).toThrow(expected);
    });
  });

  describe('parseWorkingRelativepath', () => {
    it.each([
      ['src/users', 'users'],
      ['src', 'src'],
      ['src\\users\\products', 'products'],
    ])('parseWorkingRelativepath(%s) should RETURN %s', (input, expected) => {
      expect(FileSystemManager.parseWorkingRelativePath(input)).toBe(expected);
    });

    it.each([
      ['', PathIsEmptyException],
      ['?', PathIsNotValidException],
      [null, PathIsEmptyException],
    ])('parseWorkingRelativePath(%s) should THROW %s', (input, expected) => {
      expect(() => FileSystemManager.parseWorkingRelativePath(input)).toThrow(expected);
    });
  });

  describe('isFile', () => {
    it.each([['src/logger.ts', true]])('isFile(%s) should RETURN true', async (input, expected) => {
      expect(await FileSystemManager.isFile(input)).toBe(expected);
    });

    it.each([
      ['src/noneexisting.ts', NoSuchAFile],
      ['', PathIsEmptyException],
      [':', PathIsNotValidException],
      ['?412', PathIsNotValidException],
    ])('isFile(%s) should THROW %s', (input, expected) => {
      FileSystemManager.isFile(input).catch((err) => {
        expect(err).toBeInstanceOf(expected);
      });
    });
  });

  describe('readdirs', () => {
    it.each([
      ['testdata', ['testuser', 'one', 'two'].sort()],
      ['testdata/testuser', ['index.ts', 'testuser12'].sort()],
    ])('readdir(%s) should RETURN %s', async (input, expected) => {
      expect(await FileSystemManager.readdirs(input)).toEqual(expected.sort());
    });

    it.each([
      [':', PathIsNotValidException],
      ['', PathIsEmptyException],
    ])('readdirs(%s) should THROW %s', async (input, expected) => {
      return expect(async () => await FileSystemManager.readdirs(input)).rejects.toThrow(expected);
    });
  });

  describe('writeFile should return true.', () => {
    it('writeFile should return true', () => {
      // Find out an elegant way to test IO.
    });
  });

  describe('refactorTo', () => {
    it.each([
      [
        ['src/user', 'product'].map((e) => FileSystemManager.resolveRelativePath(e)), //input
        ['product', 'product'].map((e) => FileSystemManager.resolveRelativePath(e)), //expected
      ],
      [
        ['src/user', 'src/model/product'].map((e) => FileSystemManager.resolveRelativePath(e)),
        ['src/model/product', 'product'].map((e) => FileSystemManager.resolveRelativePath(e)),
      ],
    ])(
      'refactorTo(%s) should REFACTOR TO  %s as first relative path and the second fileName',
      (input, expected) => {
        const ninstance = new FileSystemManager('input[0]');
        ninstance.refactorTo(input[1]);

        expect(ninstance.relativeFilePath).toBe(expected[0]);
        expect(ninstance.fileName).toBe(expected[1]);
      },
    );
  });
});
