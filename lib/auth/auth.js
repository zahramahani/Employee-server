const crypto = require('crypto')
const passwordSheriff = require('password-sheriff')
const jwt = require('jsonwebtoken')

const PasswordPolicy = passwordSheriff.PasswordPolicy
const charSet = require('password-sheriff').charsets

const SALTLENGTH = process.env.SALTLENGTH ? process.env.SALTLENGTH : 128
const PRIVATEKEY = process.env.PRIVATEKEY ? process.env.PRIVATEKEY : '123456789'

exports.passwordPolicy = new PasswordPolicy({
  length: {
    minLength: 8
  },
  contains: {
    expressions: [charSet.upperCase, charSet.lowerCase, charSet.numbers, charSet.specialCharacters]
  }
  // containsAtLeast: {
  //   atLeast: 2,
  //   expressions: [charSet.upperCase, charSet.lowerCase, charSet.numbers, charSet.specialCharacters]
  // },
  // identicalChars: {
  //   max: 3
  // }
})

function genRandomString (length) {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex') /** convert to hexadecimal format */
    .slice(0, length) /** return required number of characters */
}

function createHash (password, salt) {
  let curSalt = ''
  if (!salt) {
    curSalt = genRandomString(SALTLENGTH)
  } else {
    curSalt = salt
  }

  const curHash = crypto.createHmac('sha512', curSalt).update(password).digest('hex')
  return {
    salt: curSalt,
    passwordHash: curHash
  }
};

function verifyPassword (password, salt, hash) {
  const calcHash = createHash(password, salt)
  return calcHash.passwordHash === hash
}

function signToken (payload) {
  return jwt.sign(payload, PRIVATEKEY, { expiresIn: '10m' })
}

function hasAccess (request) {
  const authHeader = request.headers.authorization
  console.log(authHeader)
  if (authHeader) {
    const authHeaderSplit = authHeader.split(' ')
    const authType = authHeaderSplit[0]
    const authToken = authHeaderSplit[1]
    if (authType === 'Bearer') {
      try {
        const payload = jwt.verify(authToken, PRIVATEKEY)
        return {
          payload: payload,
          verify: true
        }
      } catch (err) {
        console.log('1')
        return {
          payload: null,
          verify: false
        }
      }
    } else {
      console.log('2')
      return {
        payload: null,
        verify: false
      }
    }
  } else {
    console.log('3')
    return {
      payload: null,
      verify: false
    }
  }
}
exports.createHash = createHash
exports.verifyPassword = verifyPassword
exports.signToken = signToken
exports.hasAccess = hasAccess
