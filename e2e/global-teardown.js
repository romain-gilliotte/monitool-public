// Runs once after the test suite. By default we KEEP the backing services
// running so reruns are fast (determinism is guaranteed by the reset+seed in
// global-setup, not by tearing the volume down). Set E2E_TEARDOWN=1 to stop and
// remove the docker stack, or run `npm run infra:down` manually.
export default async function globalTeardown() {
    if (process.env.E2E_TEARDOWN === '1') {
        const { execFileSync } = await import('node:child_process');
        const { fileURLToPath } = await import('node:url');
        const { dirname, resolve } = await import('node:path');
        const here = dirname(fileURLToPath(import.meta.url));
        const composeFile = resolve(here, 'docker-compose.e2e.yml');
        console.log('[global-teardown] stopping docker stack…');
        execFileSync('docker', ['compose', '-f', composeFile, 'down', '-v'], { stdio: 'inherit' });
    }
}
