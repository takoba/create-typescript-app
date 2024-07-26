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
import { degit, DegitError } from 'tiged'
import packageJson from '../package.json'

const DEFAULT_TEMPLATE = 'https://github.com/takoba/typescript-app-boilerplate.git'

doesNotThrow(
  () => execSync('which git', { encoding: 'utf8' }),
  'Unexpected: git command is missing...',
)

const Command = (argv: string[]) => {
  const templateFlag = makeStringFlag('template', {
    alias: 't',
    usage:
      "GitHub Clone URL to boilerplate repo (or format modeled after tiged's src. cf. https://www.npmjs.com/package/tiged)",
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
    name: packageJson.name,
    description: `${packageJson.name} is a project generator for TypeScript app.`,
    version: packageJson.version,
    usage: 'create-typescript-app-base <app_name> [options]',
    flag,
    positionalArguments,
    handler: async (args, opts) => {
      const isDebug = opts.debug.value
      isDebug && console.debug(`DEBUG: debug mode is enabled.`)
      isDebug && console.debug(`DEBUG: debug args & opts`, { args, opts })

      const appName = args.app_name.value
      const template = opts.template.value
      console.info(`generate "${appName}" from "${template}".`)

      const appDirPath = path.resolve('.', `${appName}`)
      if (existsSync(appDirPath)) {
        console.error(`ERROR: ${appDirPath} is exists. command is finish.`)
        process.exit(1)
        return
      }

      const tiged = degit(template ?? DEFAULT_TEMPLATE)
      try {
        await tiged.clone(appDirPath)
      } catch (e: unknown) {
        if (e instanceof DegitError) {
          console.error(`ERROR: internal error. type: DegitError, message: ${e.message}`)
          process.exit(1)
        } else {
          // @TODO: don't throw, exit
          throw e
        }
      }

      const defaultAuthor = execSync(`git config --get user.name`, { encoding: 'utf8' }).trim()
      const defaultRepository = `https://github.com/${defaultAuthor}/${appName}`
      const defaultEmail = execSync(`git config --get user.email`, { encoding: 'utf8' }).trim()
      const { name, description, repository, author, email } = await prompts([
        {
          type: 'text',
          name: 'name',
          message: 'What your app name wrote package.json',
          initial: appName,
        },
        {
          type: 'text',
          name: 'description',
          message: 'What your app description wrote package.json',
        },
        {
          type: 'text',
          name: 'repository',
          message: 'What your repository wrote package.json',
          initial: defaultRepository,
        },
        {
          type: 'text',
          name: 'author',
          message: 'What your author name wrote package.json',
          initial: defaultAuthor,
        },
        {
          type: 'text',
          name: 'email',
          message: 'What your email wrote package.json',
          initial: defaultEmail,
        },
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
          .replace('__AUTHOR_EMAIL__', email),
      )
      isDebug &&
        console.debug(
          `DEBUG echo ${packageJsonFilepath}`,
          readFileSync(packageJsonFilepath, { encoding: 'utf8' }),
        )

      const readmeFilepath = `${appDirPath}/README.md`
      const readmeTxt = `# ${name}\n${description}\n`
      writeFileSync(readmeFilepath, readmeTxt)
      isDebug &&
        console.debug(
          `DEBUG echo ${readmeFilepath}`,
          readFileSync(readmeFilepath, { encoding: 'utf8' }),
        )

      const initialCommitMessage = ':tada: Initial commit'
      const renewGitInitCommand = `cd ${appDirPath} && git init && git add . && git commit -m '${initialCommitMessage}' && cd -`
      isDebug && console.debug(`DEBUG: exec ${renewGitInitCommand}`)
      execSync(renewGitInitCommand, { encoding: 'utf8' })

      console.info(`finish! generate "${appName}" at ${appDirPath}.`)
    },
  })(argv)
}
export default Command
