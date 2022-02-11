import { doesNotThrow } from 'assert'
import { execSync } from 'child_process'
import {
  makeCommand,
  makeStringFlag,
  reduceFlag,
  makeStringArgument,
  makePositionalArguments,
  makeBooleanFlag,
} from 'catacli'
import packageJson from '../package.json'

const DEFAULT_TEMPLATE = 'https://github.com/takoba/typescript-app-boilerplate.git'

doesNotThrow(() => execSync('which git', { encoding: 'utf8' }), 'Unexpected: git command is missing...')

const Command = (argv: string[]) => {
  const templateFlag = makeStringFlag('template', {
    alias: 't',
    usage: 'GitHub Clone URL to boilerplate repo',
    default: DEFAULT_TEMPLATE,
  })
  const helpFlag = makeBooleanFlag('help', {
    alias: 'h',
    usage: 'show usage',
  })
  const flag = reduceFlag(templateFlag, helpFlag)

  const appNameArg = makeStringArgument('app_name', {
    usage: 'app name (uses making directory name)',
  })
  const positionalArguments = makePositionalArguments(appNameArg)

  return makeCommand({
    name: 'create-typescript-app',
    description: 'create-typescript-app is a project generator for TypeScript app.',
    version: packageJson.version,
    flag,
    positionalArguments,
    handler: (args, opts) => {
      console.log(args, opts)

      const appName = args.app_name.value
      const template = opts.template.value
      console.info(`generate "${appName}" from "${template}".`)

      const appDirPath = `./${appName}`
      const gitCloneCommand = `git clone ${template} ${appDirPath}`
      console.debug(`exec \`${gitCloneCommand}\``)
      execSync(gitCloneCommand, { encoding: 'utf8' })
    },
  })(argv)
}
export default Command
