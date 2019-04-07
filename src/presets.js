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

  webpack: {
    before: function(server, request, response) {
      let path = this.getPath(request, response), newResponse;
      try {
        newResponse = require(`fixtures/${path}.fixture.js`).default;
      } catch (err) {
        return {status:404}
      }

      newResponse = Object.assign({}, response, newResponse)

      return {
        ...newResponse,
        headers: {'content-type': 'application/json'},
        wrapper: body => JSON.stringify(body)
      }
    }
  },

  204: {
    body: null,
    status: 204,
    statusText: 'No Content'
  },

  400: {
    body: null,
    status: 400,
    statusText: 'Bad Request'
  },

  401: {
    body: null,
    status: 401,
    statusText: 'Unauthorized'
  },

  403: {
    body: null,
    status: 403,
    statusText: 'Forbidden'
  },

  404: {
    body: null,
    status: 404,
    statusText: 'Not found'
  },

  500: {
    body: null,
    status: 500,
    statusText: 'Internal Server Error'
  }
}
