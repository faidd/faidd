#!/usr/bin/env node
import { createAgent } from '@faidd/logic';
import chalk from 'chalk';

function main() {
  console.log(chalk.cyan.bold('\n--- FAIDD CLI v0.1.1 ---'));
  const agent = createAgent('Sovereign-Alpha');
  console.log(chalk.green(`\n[OK] Agent initialized: ${chalk.yellow(agent.name)} (${agent.id})`));
  console.log(chalk.gray('\nReady for B-MAD Rules Engine integration.\n'));
}

main();
