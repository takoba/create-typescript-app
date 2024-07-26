import type { JestConfigWithTsJest } from 'ts-jest'

const config: JestConfigWithTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.{test,spec}.?(c|m)ts?(x)'],
  moduleNameMapper: {
    // @todo When have been supported type definition files in tiged, remove it
    '^tiged$': '<rootDir>/@types/tiged.d.ts',
  },
}
export default config
