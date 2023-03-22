/* eslint-disable */
const LTIAAS_URL = getLtiaasURL()

const FORM = '<div class="form-input"><label for="input-field">Enter values:</label><input type="email" class="form-control" id="input-field" aria-describedby="help" placeholder="example1,example2,example3"><small id="emailHelp" class="form-text text-muted">Enter comma separated values: "example1,example2,example3"</small></div>'

const clearModal = () => {
  $('#modal-label').html('Status: ...')
  $('.modal-body').html('<h4><pre>...</pre></h4>')
  $('#btn-submit').remove()
}

const populateModal = (status, content) => {
  $('#modal-label').html(`Status: ${status}`)
  $('.modal-body').html(`<h4><pre>${JSON.stringify(content, null, 2)}</pre></h4>`)
}

const displayForm = (fn) => {
  $('#modal-label').html('Input:')
  $('.modal-body').html(FORM)
  btn = document.createElement('button')
  btn.setAttribute('id', 'btn-submit')
  btn.setAttribute('type', 'button')
  btn.setAttribute('class', 'btn btn-success')
  btn.setAttribute('onclick', `submitForm(${fn})`)
  btn.textContent = 'Submit'
  $('#btn-close').after(btn)
}

const buildLtiaasRequest = (method, endpoint, data, headers) => {
  const urlParams = new URLSearchParams(window.location.search)
  const ltik = urlParams.get('ltik')
  const config = {
    baseURL: `/api/`,
    url: endpoint,
    method: method,
    headers: { x_ltik: ltik, ...(headers || {}) }
  }
  if (data) {
    if (method == 'get') config.params = data
    else config.data = data
  }
  return config
}

const populateModalWithLtiaasRequest = (method, endpoint, data, headers) => {
  clearModal()
  config = buildLtiaasRequest(method, endpoint, data, headers)
  axios.request(config)
    .then(function (response) {
      populateModal(response.status, response.data)
    })
    .catch(function (error) {
      console.log(error)
      if (error.response) populateModal(error.response.status, error.response.data)
      else if (error.request) populateModal(500, { error: 'Request error' })
      else populateModal(500, { error: error.message })
    })
}

function openForm (fn) {
  clearModal()
  displayForm(fn)
}

function submitForm (fn) {
  const value = $('#input-field').val()
  const inputs = value.split(',')
  console.log(inputs)
  fn(...inputs)
}

// Request methods
function getIdToken () {
  populateModalWithLtiaasRequest('get', '/idtoken')
}

function getRawIdToken () {
  populateModalWithLtiaasRequest('get', '/idtoken', { raw: true })
}

function getMemberships () {
  populateModalWithLtiaasRequest('get', '/memberships')
}

function getLineItems () {
  populateModalWithLtiaasRequest('get', '/lineitems')
}

function createLineItem (label, tag) {
  const lineItem = {
    scoreMaximum: 100,
    label: label,
    tag: tag
  }
  populateModalWithLtiaasRequest('post', '/lineitems', lineItem)
}

function getLineItemById (id) {
  populateModalWithLtiaasRequest('get', '/lineitems', false, { x_lineitem: id})
}

function updateLineItemById (id, label) {
  const lineItem = {
    scoreMaximum: 100,
    label: label
  }
  populateModalWithLtiaasRequest('put', '/lineitems', lineItem, { x_lineitem: id})
}

function deleteLineItemById (id) {
  populateModalWithLtiaasRequest('delete', '/lineitems', false, { x_lineitem: id})
}

function retrieveScores (id) {
  populateModalWithLtiaasRequest('get', '/lineitems/scores', false, { x_lineitem: id})
}

function submitScores (id, user, score) {
  const scoreObj = {
    userId: user,
    activityProgress: 'Completed',
    gradingProgress: 'FullyGraded',
    scoreGiven: parseInt(score),
    comment: 'This is exceptional work.'
  }
  populateModalWithLtiaasRequest('post', '/lineitems/scores', scoreObj, { x_lineitem: id})
}

function performDeepLinking () {
  const link = {
    contentItems: [{
      type: 'ltiResourceLink',
      url: `${LTIAAS_URL}/lti/launch?resourceid=123456`,
      title: 'Resource'
    }],
    options: {
      message: 'Deep Linking successful!',
      log: 'deep_linking_successful'
    }
  }
  config = buildLtiaasRequest('post', '/deeplinking', link)
  axios.request(config)
    .then(function (response) {
      $('body').append(response.data.form)
    })
    .catch(function (error) {
      console.log(error)
    })
}
