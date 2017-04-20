const test = require('tape')
const jwt = require('jsonwebtoken')
const promisify = require('functional-js/promises/promisify')
const jwtVerify = promisify(jwt.verify)

const createJwt = require('../lib/createJwt')

const privateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEApU4JW+EgeFUZG2hI3n7C0x8/gSerp1Ga90JOTkeH9+KL+FU/wankZCBx
cHp/NgBlbuvdrdD8/Ym3CYwNiqC7CETztkXPRI4hWG2Z/eYZ4D9GKnxFviAAJ4TNr7esWjN7
s12wnoD4KM5I9agKHobMGMPbiifOeYtgj2mVrkqlowlgw/WnpcPjXCnEXt6fns3LRPpsmruI
uCX3G4P9Sv+D3BK/RWSjXtfohmTLdo7mfg9fDJAv3I9N93kD1zZXanpQJE5UjmuUzpMtHW20
2rxib5Y412Ds0qKC5AtgfM9BTUIaz9KVP2Y9YXgM6QdOL2zgNJHJUE7sUIw36fJ258FM2wID
AQABAoIBAGEfJV6HOdWZYgP5VH7tCTiTrnMKxM6sopjNq0ZQvrFEuKoyJCB72gV+DkhgoGcw
+meeSwN5u3qXNCR21enyH5FvOaWJBIsp2qui0Ywcam2Xn3kMxMk88fpGC7dG+guRHge3bzLh
YWxQLwuuLCvdVQLj6BQW6Tf+TMBV76yUjRbpT0cXzQM9HHSlRZwmGFQ137agAfEXnA2gBVCk
UkNDaS4DOeNEKgR5GstUCM3AKrv9HbYr3uUyUzRmpnISJQt6lU5/eoqa0+BDwNVCHTjEQjVq
VROwcr/uUtiCgMN8Up8mpBmdYP+QhBO/2GCtHzkqL3iawyx/Dlqg+fACxzwrUhkCgYEA/yR0
UxxaS9wQsNHrtBwgtCs9pq2W5QwRaGqe4Zkvw+KCjAa069SUolAFHG8W2J4P0lFzzRnu+ETj
qjpHPggZQYfx+XVCluYP7bKN20yRPi0EhKscZjX7xStTyI4r7YKp737HuYRjHBsWtLYYGPRM
rS8OvK5manin9NDD+3LoFg8CgYEApdxHS3zn5SgFRoWQfGYembGGMtdYgNNupRC98UzIhSIH
qS3aIeX6VPnOo7HnM0xc6OdTeznrLJJmJ0ksI129r2rN6xxQ0dkeBGfKNK/cH+F/ZbGsOChB
er7srgnZhLbmXELTI9IIUyghUZmmdEbTC8iXG/tqUDHMBJiU7w3VSHUCgYEAzl+cP8WFPCsK
zRtfPdYqldEMExACJ861HfJwBSa1PgqvcbfTC5Zti0SSfcdVgW2IeqQruNCrPOHsDLsK+R/v
3dOqZA73B7ubUrbEi4fJS7N6Hh2R4RL1TSyYnnZxDbJM5k10G5j72bYHjbBkmXqxsruHfhLL
AIALyrg6bd8p3v0CgYBbkGP7lJUguRtQd2PwiR/TkWGYp7HATPkEP13c3JrGhKbeCuYlWKT+
THp7fDc65qlUGoDHwo3GKXwjrA2l6JZTRQ8xAIzNjKM5o2LJ+1v2bbK7HX8J8Y9UiBp5ag6f
aal6vZl6aPUXk0vxlHWEM6VHGBHz7LQgWZ1b3DA8WNKqEQKBgQDPnXNz8O+SPPaGc92bRNQW
2CPB56qkJm/rPrYTO9N+DBKvALcuZHnujI5ph1wmiUdkSe/k99ihiCk/dncXa8MkBPbf6BmD
0EfrNr2oyMc3yMXz2CRzEh+zDZPCXwFH4C5oZ3vVwO4A8Sm3L9sibJw/FMqAvVWWGw+iRqRo
0IIkAA==
-----END RSA PRIVATE KEY-----`

const publicKey = `-----BEGIN RSA PUBLIC KEY-----
MIIBCgKCAQEApU4JW+EgeFUZG2hI3n7C0x8/gSerp1Ga90JOTkeH9+KL+FU/wankZCBxcHp/
NgBlbuvdrdD8/Ym3CYwNiqC7CETztkXPRI4hWG2Z/eYZ4D9GKnxFviAAJ4TNr7esWjN7s12w
noD4KM5I9agKHobMGMPbiifOeYtgj2mVrkqlowlgw/WnpcPjXCnEXt6fns3LRPpsmruIuCX3
G4P9Sv+D3BK/RWSjXtfohmTLdo7mfg9fDJAv3I9N93kD1zZXanpQJE5UjmuUzpMtHW202rxi
b5Y412Ds0qKC5AtgfM9BTUIaz9KVP2Y9YXgM6QdOL2zgNJHJUE7sUIw36fJ258FM2wIDAQAB
-----END RSA PUBLIC KEY-----`

const getMockState = () =>
    ({
        props: {
            realm: 'realm',
            client_id: 'client_id',
            username: 'username'
        },
        user: {
            roles: ['abc']
        },
        logs: []
    })

test('actions.createJwt with invalid cert returns state with errors ', t => {
    t.plan(1)

    const state = getMockState()
    const readFile = () => Promise.resolve('invalid cert')

    createJwt(readFile, state)
        .catch(err => {
            t.equal(err.toString(), 'Error: error:0906D06C:PEM routines:PEM_read_bio:no start line')
        })
})

test('actions.createJwt returns id_token', t => {
    t.plan(5)

    const state = getMockState()
    const readFile = () => Promise.resolve(privateKey)

    createJwt(readFile, state)
        .then(token => {
            jwtVerify(token.id_token, publicKey)
                .then(token => {
                    t.ok(token.iat, 'iat must exist')
                    t.ok(token.jti, 'token.jti must exist')
                    t.equal(token.aud, state.props.client_id, 'token.aud must match props.client_id')
                    t.equal(token.realm, state.props.realm, 'token.realm must match props.realm')
                    t.equal(token.sub, state.props.username, 'token.sub must match props.username')
                })
        })
})

test('actions.createJwt returns refresh_token', t => {
    t.plan(5)

    const state = getMockState()
    const readFile = () => Promise.resolve(privateKey)

    createJwt(readFile, state)
        .then(token => {
            jwtVerify(token.refresh_token, publicKey)
                .then(token => {
                    t.ok(token.iat, 'iat must exist')
                    t.ok(token.jti, 'token.jti must exist')
                    t.equal(token.aud, state.props.client_id, 'token.aud must match props.client_id')
                    t.equal(token.realm, state.props.realm, 'token.realm must match props.realm')
                    t.equal(token.sub, state.props.username, 'token.sub must match props.username')
                })
        })
})

test('actions.createJwt returns access_token', t => {
    t.plan(6)

    const state = getMockState()
    const readFile = () => Promise.resolve(privateKey)

    createJwt(readFile, state)
        .then(token => {
            jwtVerify(token.access_token, publicKey)
                .then(token => {
                    t.ok(token.iat, 'iat must exist')
                    t.ok(token.jti, 'token.jti must exist')
                    t.equal(token.roles[0], state.user.roles[0], 'token.roles must match state.user.roles')
                    t.equal(token.aud, state.props.client_id, 'token.aud must match props.client_id')
                    t.equal(token.realm, state.props.realm, 'token.realm must match props.realm')
                    t.equal(token.sub, state.props.username, 'token.sub must match props.username')
                })
        })
})