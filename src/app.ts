// @TODO This is mock object. please implement your app.
const app = {
  start: () => console.log('exec app.start()')
}

;(async () => {
  app.start()
  console.info(`INFO: app is running!`, { app })
})()
