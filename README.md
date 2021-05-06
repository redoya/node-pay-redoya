# pay-redoya
A module that mode for Redoya.NET Pay API

# Installation
``npm i pay-redoya``

# API
## RedoyaPay.createOrderURL(price, isInTestMode, successfulURL, failURL, vendorToken, secret, expiresIn)
Creates and returns a URL to redirect the customer to the link for making a payment.

## await RedoyaPay.verifyOrder(orderId, vendorToken)
Returns an object with the order result. [Click to see the API docs for more information. (Look at API > POST /api/v1/order/verify/:orderId section.)](http://docs.pay.redoya.net/en/Full.html)

# Example
[Check example folder.](./example/index.js)