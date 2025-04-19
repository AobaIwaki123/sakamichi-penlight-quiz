import { readFileSync } from 'fs';

export function getAppVersion(): string {
  const packageJson = JSON.parse(
    readFileSync('/app/package.json', 'utf8')
  );
  return packageJson.version;
}
