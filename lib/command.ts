//import cp from 'child_process'
import {
  makeCommand,
  makeStringFlag,
  reduceFlag,
  makeStringArgument,
  makePositionalArguments,
  makeBooleanFlag
} from 'catacli'
import packageJson from '../package.json'

const DEFAULT_TEMPLATE = 'https://github.com/takoba/typescript-app-boilerplate.git'

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
    },
  })(argv)
}
export default Command
