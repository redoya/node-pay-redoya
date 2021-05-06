const Validator = require('fastest-validator');
const v = new Validator();

const orderCreationArgs = {
    price: { type: 'number', positive: true, integer: true, min: 3, max: 1000 },
    isInTestMode: { type: 'number', integer: true, min: 0, max: 1 },
    successfulURL: { type: 'string', min: 16, max: 1200 },
    failURL: { type: 'string', min: 16, max: 1200 },
    vendorToken: { type: 'string', min: 16, max: 1200 },
    secret: { type: 'string', min: 3, max: 255 },
    expiresIn: { type: 'number', min: 11 * 60, max: 60 * 60 * 24 * 365, optional: true },
};

exports.checkOrder = v.compile(orderCreationArgs);