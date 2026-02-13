// cli.ts — generic CLI utilities
import process from 'process';

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const clearConsole = () => {
    // console.clear() doesn't always work as expected in all terminals/runners
    process.stdout.write('\x1Bc');
};

export const exit = (code = 0) => {
    process.exit(code);
};

export const extractSection = (content: string, section: string) => {
    const regex = new RegExp(`## ${section}\\n([\\s\\S]*?)(?=\\n##|$)`);
    const match = content.match(regex);
    return match ? match[1].trim() : '';
};
