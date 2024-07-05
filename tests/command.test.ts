import { describe, it, expect } from '@jest/globals'
import Command from '../lib/command'

describe('export const Command', () => {
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
})
