import path from 'path'
import { describe, it, expect } from '@jest/globals'

const appName = 'test-app'
const alreadyExistsPath = path.resolve('.', appName)
jest.mock('fs', () => ({
  existsSync: (path: string) => path === alreadyExistsPath,
}))
import Command from '../lib/command'

const processExitMock = (process.exit = jest.fn((code) => code as never))

describe('export const Command', () => {
  afterEach(() => {
    processExitMock.mockReset()
  })

  it('write help text to stdout', () => {
    // arrange
    const stdoutWriterMock = (process.stdout.write = jest.fn())

    // act
    Command(['-h'])

    // assert
    expect(stdoutWriterMock).toHaveBeenCalledWith(
      expect.stringContaining('create-typescript-app-base <app_name> [options]'),
    )
  })
  it('occurred error what exists dir already', () => {
    // arrange
    //const stderrWriterMock = (process.stderr.write = jest.fn())
    const consoleErrorMock = (console.error = jest.fn())

    // act
    Command([appName])

    // assert
    expect(processExitMock).toHaveBeenCalled()
    expect(processExitMock).toHaveBeenCalledWith(1)
    expect(consoleErrorMock).toHaveBeenLastCalledWith(
      expect.stringContaining(`ERROR: ${alreadyExistsPath} is exists. command is finish.`),
    )
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })
})
