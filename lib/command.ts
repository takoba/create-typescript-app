import { doesNotThrow } from 'assert'
import { execSync } from 'child_process'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'
import {
  makeCommand,
  makeStringFlag,
  reduceFlag,
  makeStringArgument,
  makePositionalArguments,
  makeBooleanFlag,
} from 'catacli'
import prompts from 'prompts'
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
    handler: async (args, opts) => {
      const isDebug = opts.debug.value
      isDebug && console.debug(`DEBUG: debug mode is enabled.`)
      isDebug && console.debug(`DEBUG: debug args & opts`, { args, opts })

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
      isDebug && console.debug(`DEBUG: exec \`${gitCloneCommand}\``)
      execSync(gitCloneCommand, { encoding: 'utf8' })

      const defaultAuthor = execSync(`git config --get user.name`, { encoding: 'utf8' }).trim()
      const defaultRepository = `https://github.com/${defaultAuthor}/${appName}`
      const defaultEmail = execSync(`git config --get user.email`, { encoding: 'utf8' }).trim()
      const { name, description, repository, author, email } = await prompts([
        { type: 'text', name: 'name', message: 'What your app name wrote package.json & app.json', initial: appName },
        { type: 'text', name: 'description', message: 'What your app description wrote package.json & app.json' },
        {
          type: 'text',
          name: 'repository',
          message: 'What your repository wrote package.json & app.json',
          initial: defaultRepository,
        },
        { type: 'text', name: 'author', message: 'What your author name wrote package.json', initial: defaultAuthor },
        { type: 'text', name: 'email', message: 'What your email wrote package.json', initial: defaultEmail },
      ])
      const { website } = await prompts([
        { type: 'text', name: 'website', message: 'What website wrote app.json', initial: repository },
      ])

      const packageJsonFilepath = `${appDirPath}/package.json`
      isDebug && console.debug(`DEBUG: read package.json`)
      const packageJsonTxt = readFileSync(packageJsonFilepath, { encoding: 'utf8' })
      isDebug && console.debug(`DEBUG: echo ${packageJsonFilepath}`, { packageJsonTxt })
      writeFileSync(
        packageJsonFilepath,
        packageJsonTxt
          .replace('__NAME__', name)
          .replace('__DESCRIPTION__', description)
          .replace('__REPOSITORY__', repository)
          .replace('__AUTHOR__', author)
          .replace('__AUTHOR_EMAIL__', email)
      )
      isDebug &&
        console.debug(`DEBUG echo ${packageJsonFilepath}`, readFileSync(packageJsonFilepath, { encoding: 'utf8' }))

      const appJsonFilepath = `${appDirPath}/app.json`
      isDebug && console.debug(`DEBUG: read app.json`)
      const appJsonTxt = readFileSync(appJsonFilepath, { encoding: 'utf8' })
      isDebug && console.debug(`DEBUG: echo ${appJsonFilepath}`, { appJsonTxt })
      writeFileSync(
        appJsonFilepath,
        appJsonTxt
          .replace('__NAME__', name)
          .replace('__DESCRIPTION__', description)
          .replace('__REPOSITORY__', repository)
          .replace('__WEBSITE__', website)
      )
      isDebug &&
        console.debug(`DEBUG echo ${appJsonFilepath}`, readFileSync(appJsonFilepath, { encoding: 'utf8' }))
    },
  })(argv)
}
export default Command
