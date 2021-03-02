#!/usr/bin/env node

const { hideBin } = require('yargs/helpers');
import { Logger } from './logger';
import { FileTree } from './FileTree';
import yargs = require('yargs');

export const runCLI = () =>
  yargs(hideBin(process.argv))
    .scriptName('refactor-template')
    .command(
      'refactor [source] [target] [placeholder]',
      'copy folder',
      (yargs) => {
        yargs.positional('source', {
          describe: 'name of the source folder/file',
        });
        yargs.positional('target', {
          describe: 'name of the target folder/file',
        });
        yargs.positional('placeholder', {
          describe: 'Text to be replaced from content of the files and file and folder names.',
        });
      },
      (argv) => {
        const { source, target } = argv;
        if (source && target && typeof source == 'string' && typeof target == 'string') {
          new FileTree(source, true).init().then((f) => {
            f.refactorTo(target)
              .writeToFiles()
              .then((result) => {})
              .catch((err) => {
                Logger.error('Could not write the files', 'Refactor');
              });
          });
        }
        Logger.info('Please pass target(1) and source(2)', __filename);
      },
    )
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      description: 'Run with verbose logging',
    }).argv;
