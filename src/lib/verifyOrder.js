const { post } = require('axios');

exports.verifyOrder = async function (orderId, vendorToken) {
    return await post(`https://pay.redoya.net/api/v1/order/verify/${orderId}`
        , { identifier: vendorToken }
    ).then((response) => {
        return response.data;
    }).catch((err) => {
        throw new Error(JSON.stringify(err));
    });
};