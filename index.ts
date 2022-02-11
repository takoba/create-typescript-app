import Command from './lib/command'
;((argv) => Command(argv))(process.argv.splice(2))
