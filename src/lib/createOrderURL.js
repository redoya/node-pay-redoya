const { sign } = require('jsonwebtoken');
const { checkOrder } = require('../util/validator');

exports.createOrderURL = function (price, isInTestMode, successfulURL, failURL, vendorToken, secret, expiresIn) {
  const orderValidationResult = checkOrder({ price, isInTestMode, successfulURL, failURL, vendorToken, secret, expiresIn });
  if (orderValidationResult !== true)
    throw new Error(`Invalid parameters! ${orderValidationResult[0].message}`);
  const orderToken = (
    typeof expiresIn === 'number'
      ? sign({ price, isInTestMode, successfulURL, failURL }, secret, { expiresIn })
      : sign({ price, isInTestMode, successfulURL, failURL }, secret)
  );
  return `https://pay.redoya.net/checkout#${orderToken}#${vendorToken}`;
};