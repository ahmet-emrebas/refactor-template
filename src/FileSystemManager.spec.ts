import {
  PathIsEmptyException,
  PathIsNotValidException,
  FileSystemManager,
  NoSuchAFile,
} from './FileSystemManager';

describe('FileSystemManager', () => {
  const instance = new FileSystemManager('testdata');

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
});
