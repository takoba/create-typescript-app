declare module 'tiged' {
  class Degit {
    clone: (dest: string) => Promise<void>
  }
  class DegitError extends Error {
    constructor(message?: string, opts?: object)
  }
  function degit(src: string, opts?: object): Degit
}
