import { Template, defaultBuildLogger } from 'e2b'
import { template } from './template'

/**
 * Builds the provided template for production using the default build logger.
 *
 * Invokes Template.build with the local template, sets the build alias to
 * "name-your-template", and routes build logs through the default build logger.
 */
async function main() {
  await Template.build(template, {
    alias: 'name-your-template',
    onBuildLogs: defaultBuildLogger(),
  });
}

main().catch(console.error);