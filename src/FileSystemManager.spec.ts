import {
  PathIsEmptyException,
  PathIsNotValidException,
  FileSystemManager,
  NoSuchAFile,
  NoSuchADirectory,
} from './FileSystemManager';

describe('FileSystemManager', () => {
  it('FileSystemManager should instantiate correctly.', () => {
    const fsm = new FileSystemManager('testdata', 'content');

    expect(fsm.content).toBe('content');
    expect(fsm.fileName).toBe('testdata');
    expect(fsm.relativeFilePath).toBe('testdata');
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
      const actual = await FileSystemManager.isFile(input);
      expect(actual).toBe(expected);
    });

    it.each([
      ['src/noneexisting.ts', NoSuchAFile],
      ['', PathIsEmptyException],
      [':', PathIsNotValidException],
      ['?412', PathIsNotValidException],
    ])('isFile(%s) should THROW %s', async (input, expected) => {
      try {
        await FileSystemManager.isFile(input);
      } catch (err) {
        expect(err).toBeInstanceOf(expected);
      }
    });
  });

  describe('isDirectory', () => {
    it.each([['src', true]])('isDirectory(%s) should RETURN true', async (input, expected) => {
      const actual = await FileSystemManager.isDirectory(input);
      expect(actual).toBe(expected);
    });

    it.each([
      ['noneexistingdir', NoSuchADirectory],
      ['', PathIsEmptyException],
      [':', PathIsNotValidException],
      ['?412', PathIsNotValidException],
    ])('isDirectory(%s) should THROW %s', async (input, expected) => {
      try {
        await FileSystemManager.isDirectory(input);
      } catch (actualError) {
        expect(actualError).toBeInstanceOf(expected);
      }
    });
  });

  describe('readdirs', () => {
    it.each([
      ['testdata', ['testuser', 'one', 'two']],
      ['testdata/testuser', ['index.ts', 'testuser12']],
    ])('readdir(%s) should RETURN %s', async (input, expected) => {
      expect((await FileSystemManager.readdirs(input)).sort()).toEqual(expected.sort());
    });

    it.each([
      [':', PathIsNotValidException],
      ['', PathIsEmptyException],
    ])('readdirs(%s) should THROW %s', async (input, expected) => {
      const actualFunction = async () => await FileSystemManager.readdirs(input);
      return expect(actualFunction).rejects.toThrow(expected);
    });
  });

  describe('refactorTo', () => {
    it.each([
      ['product', ['product', 'product']], //new path , resolved path, resolved filename.
      ['src/user', ['src\\user', 'user']],
    ])(
      'refactorTo(%s) should REFACTOR TO  %s as first relative path and the second fileName',
      (input, expected) => {
        const fileInstance = new FileSystemManager('something');
        fileInstance.refactorTo(input);

        const resolvedInput = FileSystemManager.resolveRelativePath(input);
        expect(fileInstance.relativeFilePath).toBe(expected[0]);
        expect(fileInstance.fileName).toBe(expected[1]);
      },
    );
  });

  describe('toString', () => {
    it('toString() should return the content', async () => {
      const instance = new FileSystemManager('testdata');
      await instance.init();
      expect(instance.toString()).toContain('testdata');
    });
  });
});
