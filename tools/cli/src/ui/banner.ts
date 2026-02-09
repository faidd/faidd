import chalk from 'chalk';
import gradient from 'gradient-string';
import boxen from 'boxen';

/**
 * FAIDD Monumental ASCII Banner
 * Optimized for professional sovereignty and high-impact visual authority.
 */
export const displayBanner = () => {
  const ascii = `
   ▄████████    ▄████████  ▄█  ████████▄  ████████▄  
  ███    ███   ███    ███ ███  ███    ███ ███    ███ 
  ███    █▀    ███    ███ ███▌ ███    ███ ███    ███ 
 ▄███▄▄▄       ███    ███ ███▌ ███    ███ ███    ███ 
▀▀███▀▀▀     ▀███████████ ███▌ ███    ███ ███    ███ 
  ███          ███    ███ ███  ███    ███ ███    ███ 
  ███          ███    ███ ███  ███    ███ ███    ███ 
  ███          ███    █▀  █▀   ████████▀  ████████▀  
  `;

  // Deep Cobalt to Electric Cyan (The "Sovereign" Gradient)
  const faiddGradient = gradient(['#001f3f', '#0074D9', '#7FDBFF']);
  const subline = chalk.bold.cyan('      S O V E R E I G N   C O N T R O L   F R A M E W O R K   v0.1.5\n');

  process.stdout.write('\n' + faiddGradient(ascii));
  process.stdout.write(subline);

  const manifesto = boxen(
    chalk.white.italic('The future of development is autonomous. The future of security is ') + 
    chalk.white.bold('YOU.\n') +
    chalk.cyan.bold('FAIDD bridges the gap between AI speed and Human control.'),
    {
      padding: 1,
      margin: { top: 1, bottom: 1, left: 1, right: 1 },
      borderStyle: 'double',
      borderColor: '#0074D9',
      title: 'FAIDD AUTHORITY',
      titleAlignment: 'center',
    }
  );

  console.log(manifesto);
};

export const displayStatus = (level: string, integrity: string) => {
  const content = [
    `${chalk.blue('◈')} ${chalk.dim('Sovereign Grade:')} ${chalk.bold.green(level)}`,
    `${chalk.blue('◈')} ${chalk.dim('System Integrity:')} ${chalk.bold.green(integrity)}`,
  ].join('\n');

  console.log(boxen(content, {
    padding: 0,
    margin: { bottom: 1, left: 2 },
    borderStyle: 'none',
  }));
};
