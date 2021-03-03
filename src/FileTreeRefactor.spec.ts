import {
  FileTreeRefactor,
  PathIsEmptyException,
  PathIsNotValidException,
} from './FileTreeRefactor';

describe('FileTreeRefactor', () => {
  const instance = new FileTreeRefactor('testdata');

  describe('isRelativePathValid', () => {
    // Valid arguments
    it.each(['src/user', 'src/users/user'])(
      'isRelativePathValid("%s") should RETURN true',
      (input) => {
        expect(FileTreeRefactor.isRelativePathValid(input)).toBe(true);
      },
    );

    it.each(['src"', 'src?', 'src>', 'src<'])(
      'isRelativePathValid("%s") should THROW PathIsNotValidException',
      (input) => {
        expect(() => FileTreeRefactor.isRelativePathValid(input)).toThrow(PathIsNotValidException);
      },
    );

    it.each([['', PathIsEmptyException]])(
      'isRelativePathValid(%s) should THROW %s',
      (input, expected) => {
        expect(() => FileTreeRefactor.isRelativePathValid(input)).toThrow(expected);
      },
    );
  });

  describe('resolveRelativepath', () => {
    it.each([
      ['src', 'src'],
      ['src/users', 'src\\users'],
    ])('resolveRelativePath(%s) should RETURN %s', (input, expected) => {
      expect(FileTreeRefactor.resolveRelativePath(input)).toBe(expected);
    });

    it.each([
      ['', PathIsEmptyException],
      [':', PathIsNotValidException],
    ])(`resolveRelativePath(%s) should THROW %s`, (input, expected) => {
      expect(() => FileTreeRefactor.resolveRelativePath(input)).toThrow(expected);
    });
  });

  describe('parseWorkingRelativepath', () => {
    it.each([
      ['src/users', 'users'],
      ['src', 'src'],
      ['src\\users\\products', 'products'],
    ])('parseWorkingRelativepath(%s) should RETURN %s', (input, expected) => {
      expect(FileTreeRefactor.parseWorkingRelativePath(input)).toBe(expected);
    });

    it.each([
      ['', PathIsEmptyException],
      ['?', PathIsNotValidException],
      [null, PathIsEmptyException],
    ])('parseWorkingRelativePath(%s) should THROW %s', (input, expected) => {
      expect(() => FileTreeRefactor.parseWorkingRelativePath(input)).toThrow(expected);
    });
  });
});
