import { execSync } from 'child_process';

try {
  console.log('Running all tests using Jest...');
  const output = execSync('NODE_OPTIONS=--experimental-vm-modules npx jest', { encoding: 'utf-8' });
  console.log(output);
} catch (error) {
  console.error('Error running tests:');
  if (error.stdout) {
    console.error(`Stdout:\n${error.stdout}`);
  }
  if (error.stderr) {
    console.error(`Stderr:\n${error.stderr}`);
  }
  process.exit(1);
}
