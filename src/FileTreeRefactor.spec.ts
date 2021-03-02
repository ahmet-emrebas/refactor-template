import { FileTreeRefactor, PathIsNotValidException } from './FileTreeRefactor';

describe('FileTreeRefactor', () => {
  const instance = new FileTreeRefactor('testdata');

  describe('isRelativePathValid', () => {
    it.each([
      ['src/user', true],
      ['src/users/user', true],
    ])('should return true', (input) => {
      expect(FileTreeRefactor.isRelativePathValid(input)).toBe(true);
    });

    it.each(['src:', 'src"', 'src?', 'src>', 'src<'])(
      'should throw PathIsNotValidException',
      (input) => {
        expect(() => FileTreeRefactor.isRelativePathValid(input)).toThrow(PathIsNotValidException);
      },
    );
  });
});
