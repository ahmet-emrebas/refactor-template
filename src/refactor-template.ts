#!/usr/bin/env node

const { hideBin } = require('yargs/helpers');
import { Logger } from './logger';
import { FileTree } from './FileTree';
import yargs = require('yargs');

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
      async (argv) => {
        const { source, target } = argv;
        try {
          const fileTree = await new FileTree(source as string, true).init();
          await fileTree.refactorTo(target as string).writeToFiles();
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
