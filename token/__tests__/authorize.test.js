const status = require('http-status')
const authorize = require('../authorize')

const actions = {
    getRealm: realm =>
        Promise.resolve(realm === 'demo' ? { realmId: 'demo', auth_uri: 'http://auth.uri/demo/login' } : null)
}

describe('authorize', () => {
    test('no realm fails', () => {
        expect.assertions(1)

        const request = {}
        
        return authorize(request, actions)
            .catch(err => expect(err).toBe('"realm" is required'))
    })

    test('no response_type fails', () => {
        expect.assertions(1)

        const request = {
            path: { realm: 'demo' }
        }
        
        return authorize(request, actions)
            .catch(err => expect(err).toBe('"response_type" is required'))
    })

    test('invalid response_type fails', () => {
        expect.assertions(1)

        const request = {
            path: { realm: 'demo' },
            response_type: 'fail'
        }
        
        return authorize(request, actions)
            .catch(err => expect(err).toBe('"response_type" must be one of [code]'))
    })

    test('no scope fails', () => {
        expect.assertions(1)

        const request = {
            path: { realm: 'demo' },
            response_type: 'code'
        }
        
        return authorize(request, actions)
            .catch(err => expect(err).toBe('"scope" is required'))
    })

    test('no client_id fails', () => {
        expect.assertions(1)

        const request = {
            path: { realm: 'demo' },
            response_type: 'code',
            scope: 'openid'
        }
        
        return authorize(request, actions)
            .catch(err => expect(err).toBe('"client_id" is required'))
    })

    test('no redirect_uri fails', () => {
        expect.assertions(1)

        const request = {
            path: { realm: 'demo' },
            response_type: 'code',
            scope: 'openid',
            client_id: 'client_id'
        }
        
        return authorize(request, actions)
            .catch(err => expect(err).toBe('"redirect_uri" is required'))
    })

    test('getRealm fails then returns fail', () => {
        expect.assertions(3)

        const request = {
            path: { realm: 'invalid' },
            response_type: 'code',
            scope: 'openid',
            client_id: 'client_id',
            redirect_uri: 'redirect_uri'
        }

        const mocks = {
            getRealm: () => Promise.reject('Unknown failure')
        }

        return authorize(request, mocks)
            .then(response => {
                expect(response.statusCode).toBe(status.FOUND)
                expect(response.headers.Location).toBe('redirect_uri?error=Internal%20Server%20Error')
                expect(response.body).toBe('')
            })
    })

    test('invalid realm redirects to redirect_uri with error', () => {
        expect.assertions(3)

        const request = {
            path: { realm: 'invalid' },
            response_type: 'code',
            scope: 'openid',
            client_id: 'client_id',
            redirect_uri: 'redirect_uri'
        }

        return authorize(request, actions)
            .then(response => {
                expect(response.statusCode).toBe(status.FOUND)
                expect(response.headers.Location).toBe('redirect_uri?error=realm%20not%20found')
                expect(response.body).toBe('')
            })
    })

    test('need validation redirects to auth_uri', () => {
        expect.assertions(3)

        const request = {
            path: { realm: 'demo' },
            response_type: 'code',
            scope: 'openid',
            client_id: 'client_id',
            redirect_uri: 'http://redirect.uri/hello'
        }

        return authorize(request, actions)
            .then(response => {
                expect(response.statusCode).toBe(status.FOUND)
                expect(response.headers.Location).toBe('http://auth.uri/demo/login?state=&redirect_uri=http%3A%2F%2Fredirect.uri%2Fhello')
                expect(response.body).toBe('')
            })
    })
})
