// Dependencies
const path = require('path')
const axios = require('axios')
const functions = require('firebase-functions')
const sprightly = require('sprightly')
const express = require('express')
const app = express()
const api = express()
// Setup
app.engine('spy', sprightly)
app.set('views', path.join(__dirname, './pages'))
app.set('view engine', 'spy')
app.use(express.static('pages'))
// Core Launch endpoint
app.get('/launch', async (req, res) => {
  return res.render('launch.spy', {
    url: functions.config().env.ltiaasurl
  })
})
// Deep Link Launch endpoint
app.get('/deeplink', async (req, res) => {
  return res.render('deeplink.spy', {
    url: functions.config().env.ltiaasurl
  })
})

// API
const LTIAAS_URL = functions.config().env.ltiaasurl
const BEARER_AUTH_HEADER = `Bearer ${functions.config().env.apikey}`
const LTIK_AUTH_HEADER = (ltik) => `LTIK-AUTH-V1 Token=${ltik}, Additional=${BEARER_AUTH_HEADER}`

// Create deep linking message
api.post('/deeplinking', async (req, res) => {
  const url = `${LTIAAS_URL}/api/deeplinking/form`
  const response = await axios.post(url, req.body, { validateStatus: () => true, headers: { Authorization: LTIK_AUTH_HEADER(req.headers.x_ltik) } })
  return res.status(response.status).send(response.data)
})

// Retrieve ID Token
api.get('/idtoken', async (req, res) => {
  let url = `${LTIAAS_URL}/api/idtoken`
  if (req.query.raw) url += '?raw=true' // Add query parameter if retrieving raw ID Token
  const response = await axios.get(url, { validateStatus: () => true, headers: { Authorization: LTIK_AUTH_HEADER(req.headers.x_ltik) } })
  return res.status(response.status).send(response.data)
})

// Retrieve Memberships
api.get('/memberships', async (req, res) => {
  const url = `${LTIAAS_URL}/api/memberships`
  const response = await axios.get(url, { validateStatus: () => true, headers: { Authorization: LTIK_AUTH_HEADER(req.headers.x_ltik) } })
  return res.status(response.status).send(response.data)
})

// Retrieve lineitems
api.get('/lineitems', async (req, res) => {
  let url = `${LTIAAS_URL}/api/lineitems`
  if (req.headers.x_lineitem) url += `/${encodeURIComponent(req.headers.x_lineitem)}` // Retrieve lineitem by ID
  const response = await axios.get(url, { validateStatus: () => true, headers: { Authorization: LTIK_AUTH_HEADER(req.headers.x_ltik) } })
  return res.status(response.status).send(response.data)
})

// Create lineitem
api.post('/lineitems', async (req, res) => {
  const url = `${LTIAAS_URL}/api/lineitems`
  const response = await axios.post(url, req.body, { validateStatus: () => true, headers: { Authorization: LTIK_AUTH_HEADER(req.headers.x_ltik) } })
  return res.status(response.status).send(response.data)
})

// Update lineitem by ID
api.put('/lineitems', async (req, res) => {
  const url = `${LTIAAS_URL}/api/lineitems/${encodeURIComponent(req.headers.x_lineitem)}`
  const response = await axios.put(url, req.body, { validateStatus: () => true, headers: { Authorization: LTIK_AUTH_HEADER(req.headers.x_ltik) } })
  return res.status(response.status).send(response.data)
})

// Delete lineitem by ID
api.delete('/lineitems', async (req, res) => {
  const url = `${LTIAAS_URL}/api/lineitems/${encodeURIComponent(req.headers.x_lineitem)}`
  const response = await axios.delete(url, { validateStatus: () => true, headers: { Authorization: LTIK_AUTH_HEADER(req.headers.x_ltik) } })
  return res.status(response.status).send(response.data)
})

// Retrieve scores
api.get('/lineitems/scores', async (req, res) => {
  const url = `${LTIAAS_URL}/api/lineitems/${encodeURIComponent(req.headers.x_lineitem)}/scores`
  const response = await axios.get(url, { validateStatus: () => true, headers: { Authorization: LTIK_AUTH_HEADER(req.headers.x_ltik) } })
  return res.status(response.status).send(response.data)
})

// Submit score
api.post('/lineitems/scores', async (req, res) => {
  const url = `${LTIAAS_URL}/api/lineitems/${encodeURIComponent(req.headers.x_lineitem)}/scores`
  const response = await axios.post(url, req.body, { validateStatus: () => true, headers: { Authorization: LTIK_AUTH_HEADER(req.headers.x_ltik) } })
  return res.status(response.status).send(response.data)
})

// Exporting functions
exports.lti = functions.https.onRequest(app)
exports.api = functions.https.onRequest(api)
