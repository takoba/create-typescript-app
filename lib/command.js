"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("assert");
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const catacli_1 = require("catacli");
const prompts_1 = __importDefault(require("prompts"));
const package_json_1 = __importDefault(require("../package.json"));
const DEFAULT_TEMPLATE = 'https://github.com/takoba/typescript-app-boilerplate.git';
(0, assert_1.doesNotThrow)(() => (0, child_process_1.execSync)('which git', { encoding: 'utf8' }), 'Unexpected: git command is missing...');
const Command = (argv) => {
    const templateFlag = (0, catacli_1.makeStringFlag)('template', {
        alias: 't',
        usage: 'GitHub Clone URL to boilerplate repo',
        default: DEFAULT_TEMPLATE,
    });
    const helpFlag = (0, catacli_1.makeBooleanFlag)('help', {
        alias: 'h',
        usage: 'show usage',
    });
    const debugFlag = (0, catacli_1.makeBooleanFlag)('debug', {
        usage: 'toggle debug output',
        default: false,
    });
    const flag = (0, catacli_1.reduceFlag)(templateFlag, helpFlag, debugFlag);
    const appNameArg = (0, catacli_1.makeStringArgument)('app_name', {
        usage: 'app name (uses making directory name)',
    });
    const positionalArguments = (0, catacli_1.makePositionalArguments)(appNameArg);
    return (0, catacli_1.makeCommand)({
        name: 'create-typescript-app',
        description: 'create-typescript-app is a project generator for TypeScript app.',
        version: package_json_1.default.version,
        flag,
        positionalArguments,
        handler: async (args, opts) => {
            const isDebug = opts.debug.value;
            isDebug && console.debug(`DEBUG: debug mode is enabled.`);
            isDebug && console.debug(`DEBUG: debug args & opts`, { args, opts });
            const appName = args.app_name.value;
            const template = opts.template.value;
            console.info(`generate "${appName}" from "${template}".`);
            const appDirPath = path_1.default.resolve('.', `${appName}`);
            if ((0, fs_1.existsSync)(appDirPath)) {
                console.error(`ERROR: ${appDirPath} is exists. command is finish.`);
                process.exit(1);
                return;
            }
            const gitCloneCommand = `git clone ${template} ${appDirPath}`;
            isDebug && console.debug(`DEBUG: exec \`${gitCloneCommand}\``);
            (0, child_process_1.execSync)(gitCloneCommand, { encoding: 'utf8' });
            const removeGitDirCommand = `rm -rf ${appDirPath}/.git/`;
            isDebug && console.debug(`DEBUG: exec \`${removeGitDirCommand}\``);
            (0, child_process_1.execSync)(removeGitDirCommand, { encoding: 'utf8' });
            const defaultAuthor = (0, child_process_1.execSync)(`git config --get user.name`, { encoding: 'utf8' }).trim();
            const defaultRepository = `https://github.com/${defaultAuthor}/${appName}`;
            const defaultEmail = (0, child_process_1.execSync)(`git config --get user.email`, { encoding: 'utf8' }).trim();
            const { name, description, repository, author, email } = await (0, prompts_1.default)([
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
            ]);
            const { website } = await (0, prompts_1.default)([
                { type: 'text', name: 'website', message: 'What website wrote app.json', initial: repository },
            ]);
            const packageJsonFilepath = `${appDirPath}/package.json`;
            isDebug && console.debug(`DEBUG: read package.json`);
            const packageJsonTxt = (0, fs_1.readFileSync)(packageJsonFilepath, { encoding: 'utf8' });
            isDebug && console.debug(`DEBUG: echo ${packageJsonFilepath}`, { packageJsonTxt });
            (0, fs_1.writeFileSync)(packageJsonFilepath, packageJsonTxt
                .replace('__NAME__', name)
                .replace('__DESCRIPTION__', description)
                .replace('__REPOSITORY__', repository)
                .replace('__AUTHOR__', author)
                .replace('__AUTHOR_EMAIL__', email));
            isDebug &&
                console.debug(`DEBUG echo ${packageJsonFilepath}`, (0, fs_1.readFileSync)(packageJsonFilepath, { encoding: 'utf8' }));
            const appJsonFilepath = `${appDirPath}/app.json`;
            isDebug && console.debug(`DEBUG: read app.json`);
            const appJsonTxt = (0, fs_1.readFileSync)(appJsonFilepath, { encoding: 'utf8' });
            isDebug && console.debug(`DEBUG: echo ${appJsonFilepath}`, { appJsonTxt });
            (0, fs_1.writeFileSync)(appJsonFilepath, appJsonTxt
                .replace('__NAME__', name)
                .replace('__DESCRIPTION__', description)
                .replace('__REPOSITORY__', repository)
                .replace('__WEBSITE__', website));
            isDebug && console.debug(`DEBUG echo ${appJsonFilepath}`, (0, fs_1.readFileSync)(appJsonFilepath, { encoding: 'utf8' }));
            const initialCommitMessage = ':tada: Initial commit';
            const renewGitInitCommand = `cd ${appDirPath} && git init && git add . && git commit -m '${initialCommitMessage}' && cd -`;
            isDebug && console.debug(`DEBUG: exec ${renewGitInitCommand}`);
            (0, child_process_1.execSync)(renewGitInitCommand, { encoding: 'utf8' });
            console.info(`finish! generate "${appName}" at ${appDirPath}.`);
        },
    })(argv);
};
exports.default = Command;
