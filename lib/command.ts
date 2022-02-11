import { doesNotThrow } from 'assert'
import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
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
  const debugFlag = makeBooleanFlag('debug', {
    usage: 'toggle debug output',
    default: false,
  })
  const flag = reduceFlag(templateFlag, helpFlag, debugFlag)

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
      const isDebug = opts.debug.value
      isDebug && console.debug(`DEBUG: debug mode is enabled.`)
      isDebug && console.log({ args, opts })

      const appName = args.app_name.value
      const template = opts.template.value
      console.info(`generate "${appName}" from "${template}".`)

      const appDirPath = path.join('.', `${appName}`)
      if (existsSync(appDirPath)) {
        console.error(`ERROR: ${appDirPath} is exists. command is finish.`)
        process.exit(1)
        return
      }

      const gitCloneCommand = `git clone ${template} ${appDirPath}`
      isDebug && console.debug(`exec \`${gitCloneCommand}\``)
      execSync(gitCloneCommand, { encoding: 'utf8' })

      const packageJsonFilePath = `${appDirPath}/package.json`
      isDebug && console.debug(`DEBUG: read package.json`)
      const packageJsonFile = readFileSync(packageJsonFilePath, { encoding: 'utf8' })
      console.log(packageJsonFile)
    },
  })(argv)
}
export default Command
