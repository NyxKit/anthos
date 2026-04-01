import express from 'express'

import { createApiRouter } from './routes/createApiRouter.js'

export function createApp() {
  const app = express()

  app.use(express.json())
  app.use('/api', createApiRouter())

  app.get('/', (_req, res) => {
    res.send('Anthos server is running')
  })

  return app
}
