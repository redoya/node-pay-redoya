const { verify } = require('jsonwebtoken');
const { randomBytes } = require('crypto');

const { createOrderURL } = require('../src');

const vendorToken = `${randomBytes(16).toString('hex')}.${randomBytes(16).toString('hex')}.${randomBytes(16).toString('hex')}`;
const secret = randomBytes(16).toString('hex');
const orderData = {
    price: 49,
    isInTestMode: 1,
    successfulURL: "https://example.com/order/complete/{order_id}?invoiceId=123&userId=567",
    failURL: "https://example.com/order/failed",
    expiresIn: 15 * 60,
};

test('Creates order URL', () => {
    expect((() => {
        const orderJWTData = verify(
            createOrderURL(
                orderData.price, orderData.isInTestMode, orderData.successfulURL, orderData.failURL, vendorToken, secret, orderData.expiresIn
            ).split('#')[1],
            secret
        );
        if (orderJWTData.iat + orderData.expiresIn !== orderJWTData.exp) return 1;
        delete orderJWTData.iat;
        delete orderJWTData.exp;
        delete orderData.expiresIn;
        return orderJWTData;
    })()).toStrictEqual(orderData);
});