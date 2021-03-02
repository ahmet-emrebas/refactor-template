#!/usr/bin/env node

const { hideBin } = require('yargs/helpers');
import { Logger } from './logger';
import { FileTree } from './FileTree';
import yargs = require('yargs');

function runRefactorer(source: string | unknown, target: string | unknown) {
  if (!(source && target)) {
    Logger.error(
      'Please pass the source and target! For more information run refactor-template --help command',
      'Refactor',
    );
  }
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
}

export const runCLI = () => {
  yargs(hideBin(process.argv))
    .command(
      'copy [source] [target]',
      'copy and refactor template folder',
      (yargs) => {
        yargs.positional('source', {
          describe: 'name of the source folder/file',
        });
        yargs.positional('target', {
          describe: 'name of the target folder/file',
        });
      },
      (argv) => {
        const { source, target } = argv;
        runRefactorer(source, target);
      },
    )
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      description: 'Run with verbose logging',
    }).argv;
};
