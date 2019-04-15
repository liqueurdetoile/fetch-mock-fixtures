export default {
  default: {
    body: 'Hello world !',
    delay: 0,
    headers: {'content-type': 'text/html'},
    status: 200,
    statusText: 'OK'
  },

  json: {
    headers: {'content-type': 'application/json'},
    wrapper: body => JSON.stringify(body)
  },

  204: {
    body: null,
    headers: {'content-type': 'text/html'},
    status: 204,
    statusText: 'No Content'
  },

  400: {
    body: null,
    headers: {'content-type': 'text/html'},
    status: 400,
    statusText: 'Bad Request'
  },

  401: {
    body: null,
    headers: {'content-type': 'text/html'},
    status: 401,
    statusText: 'Unauthorized'
  },

  403: {
    body: null,
    headers: {'content-type': 'text/html'},
    status: 403,
    statusText: 'Forbidden'
  },

  404: {
    body: null,
    headers: {'content-type': 'text/html'},
    status: 404,
    statusText: 'Not found'
  },

  500: {
    body: null,
    headers: {'content-type': 'text/html'},
    status: 500,
    statusText: 'Internal Server Error'
  }
}
