#!/usr/bin/env node

const { hideBin } = require('yargs/helpers');
import { Logger } from './logger';
import { FileTree } from './FileTree';
import yargs = require('yargs');
import { FileSystemManager } from './FileSystemManager';

export const runCLI = () => {
  yargs(hideBin(process.argv))
    .command(
      'copy [source] [target] [placeholder] [value]',
      'copy and refactor template folder',
      (yargs) => {
        yargs.positional('source', {
          describe: 'name of the source folder/file',
        });
        yargs.positional('target', {
          describe: 'name of the target folder/file',
        });
        yargs.positional('placeholder', {
          describe: 'placeholder (the text to be changed with new value)',
        });
        yargs.positional('value', {
          describe: 'value that is replaced with all placeholder',
        });
      },
      async (argv) => {
        let { source, target, placeholder, value } = argv as { [key: string]: string };
        try {
          if (!placeholder || !placeholder?.trim()) {
            placeholder = source.split(/\\|\//g).pop();
            value = target.split(/\\|\//g).pop();
            console.log('>' + placeholder + '<placeholder');
            console.log('>' + value + '<value');
          }
          const fileTree = new FileSystemManager(source as string);
          await fileTree.init();
          fileTree.refactorTo(target, placeholder, value);
          await fileTree.writeHardFile();
        } catch (err) {
          Logger.error(err || 'Could not process the file paths!', 'Refactor');
        }
      },
    )
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      description: 'Run with verbose logging',
    }).argv;
};
