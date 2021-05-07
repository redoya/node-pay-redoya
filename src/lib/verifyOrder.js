const { post } = require('axios');

exports.verifyOrder = async function (orderId, vendorToken) {
    return await post(`https://pay.redoya.net/api/v1/order/verify/${orderId}`
        , { identifier: vendorToken }
    ).then((response) => {
        return response.data;
    }).catch((err) => {
        if (err.response.data) return err.response.data;
        throw new Error("Unknown Axios error!" + JSON.stringify(err));
    });
};