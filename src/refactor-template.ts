#!/usr/bin/env node

import yargs from 'yargs';
import { Logger } from './core';
const { hideBin } = require('yargs/helpers');

Logger.error('Some Message', __filename);
yargs(hideBin(process.argv))
  .scriptName('refactor-template')
  .command(
    'copy [source] [target]',
    'copy folder',
    (yargs) => {
      yargs.positional('source', {
        describe: 'name of the source folder/file',
      });
      yargs.positional('target', {
        describe: 'name of the target folder/file',
      });
    },
    (argv) => {
      if (argv.source && argv.target) {
        console.info(`Copying folder ${argv.source} to ${argv.target} `);
        return;
      }
      console.log('Please pass target(1) and source(2) folders');
    },
  )
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose logging',
  }).argv;
