exports.employeeIdSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    employeeId: {
      type: 'string'
    },
    org: {
      type: 'string'
    }
  },
  required: [
    'employeeId',
    'org'
  ]
}
exports.employeeHeaderSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    org: {
      type: 'string'
    }
  },
  required: [
    'org'
  ]
}
exports.employeeSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    employeeId: {
      type: 'string'
    },
    data: {
      type: 'object'
    },
    parent: {
      type: 'string'
    },
    org: {
      type: 'string'
    }
  },
  required: [
    'employeeId',
    'data',
    'parent',
    'org'
  ]
}
