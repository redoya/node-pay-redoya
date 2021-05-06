const secrets = require('./secret.json');

const port = 3000;
const isInTestMode = 1; // Booleans are not supported yet!
const baseURL = 'http://localhost:3000';
const products = {
    'asd123': { // Elma
        name: "Elma",
        price: 10,
    },
    'dfg567': { // Armut
        name: "Armut",
        price: 15.7,
    },
    'hjk345': { // Altın armut
        name: "Altın armut",
        price: 200,
    },
};

const RedoyaPay = require('../src');
const express = require('express');

const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Reaktif uygulamalar için örnek:
app.post('/orderURL', function (req, res) {
    if (!req.body.productId || !req.body.userId) return res.status(400).send('MISSING_DATA');
    if (typeof req.body.productId !== 'string' || typeof req.body.userId !== 'string') return res.status(400).send('INVALID_DATA');
    if (!products[req.body.productId]) return res.status(400).send('UNKNOWN_PRODUCT');

    let orderData = {};
    orderData.successfulURL = `${baseURL}/order/complete/{order_id}?productId=${req.body.productId}&userId=${req.body.userId}`;
    orderData.failURL = `${baseURL}/order/failed`;

    res.send(
        RedoyaPay.createOrderURL(
            products[req.body.productId].price, isInTestMode, orderData.successfulURL, orderData.failURL, secrets.vendorToken, secrets.secret
        )
    );
});

// Reaktif uygulamalarda, ürünleri dinamik
// olarak çekmek büyük bir kolaylık sağlar.
// Kendi uygulamanıza göre değiştirip uygulayabilirsiniz.
app.get('/products', function(_req, res) {
    res.send(products);
});

// Yönlendirmeli örnek:
app.get('/newOrder', function (req, res) {
    if (!req.query.productId || !req.query.userId) return res.status(400).send('MISSING_DATA');
    if (typeof req.query.productId !== 'string' || typeof req.query.userId !== 'string') return res.status(400).send('INVALID_DATA');

    let orderData = {};
    orderData.successfulURL = `${baseURL}/order/complete/{order_id}?productId=${req.query.productId}&userId=${req.query.userId}`;
    orderData.failURL = `${baseURL}/order/failed`;

    res.redirect(
        RedoyaPay.createOrderURL(
            products[req.query.productId].price, isInTestMode, orderData.successfulURL, orderData.failURL, secrets.vendorToken, secrets.secret
        )
    );
});

// Sipariş başarılı olduğunda yönlendirilecek kısım:
app.get('/order/complete/:orderId', async function (req, res) {
    try {
        if (!req.params.orderId) return res.status(400).send('MISSING_ORDERID');
        if (typeof req.params.orderId !== 'string') return res.status(400).send('INVALID_ORDERID');
        if (!req.query.productId || !req.query.userId) return res.status(400).send('MISSING_DATA');
        if (typeof req.query.productId !== 'string' || typeof req.query.userId !== 'string') return res.status(400).send('INVALID_DATA');

        const orderResult = await RedoyaPay.verifyOrder(req.params.orderId, secrets.vendorToken);
        res.set('Content-Type', 'text/html; charset=utf-8');
        let response = '';
        if (orderResult.type && orderResult.code) {
            switch (orderResult.type) {
                case 'NOT_CONFIRMED_YET':
                    response = `Sipariş henüz onaylanmamış. Ödemeyi yaptıysanız lütfen sayfayı yenilemeyi deneyin.`;
                    break;
                case 'ORDER_TIMED_OUT':
                    response = 'Sipariş zaten işleme alnmış ve son kullanım tarihi geçmiş.';
                    break;
                case 'UNKNOWN_ORDER':
                    response = 'Geçersiz sipariş.';
                    break;
                case 'UNKNOWN_ERROR':
                    response = 'Bilinmeyen hata (1)! Yetkiliye ulaşın.';
                    break;
                default:
                    response = 'Bilinmeyen hata (2)! Yetkiliye ulaşın.';
                    console.log(orderResult);
                    break;
            }
        } else {
            if (orderResult.status === 'success') {
                if (parseFloat(orderResult.payment_amount) === products[req.query.productId].price)
                    return res.status(400).send('Dolandırıcılık tespit edildi! Ödenen ücret, ürün fiyatıyla aynı değil. Bir hata olduğunu düşünüyorsanız bir yetkiliye ulaşın.');
                if (orderResult.uses !== 0) return res.status(400).send('Dolandırıcılık tespit edildi! Başarılı ödeme sinyali birden fazla verilmeye çalışıldı. Bir hata olduğunu düşünüyorsanız bir yetkiliye ulaşın.');
                response = (
                    'Sipariş başarıyla alındı!' + '<br />' +
                    '=========================' + '<br />' +
                    `Kullanıcı ID: ${req.query.userId}` + '<br />' +
                    `Ürün: ${products[req.query.productId].name}` + '<br />' +
                    `Ücreti: ${products[req.query.productId].price}` + '<br />' +
                    `Ödeme test modunda mı gerçekleşti? ` + (orderResult.testMode == '1' ? 'Evet' : 'Hayır') + '<br />' +
                    `Ödeme tarihi: ${new Date(orderResult.timestamp).toISOString()}`
                );
            } else {
                return res.status(400).send('Dolandırıcılık tespit edildi! Başarısız olan ödeme, başarılıymış gibi gösterilmeye çalışıldı. Bir hata olduğunu düşünüyorsanız bir yetkiliye ulaşın.');
            }
        }
        res.send(response);
    } catch (e) {
        console.log(e);
        res.status(500).send(JSON.stringify(e));
    }
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});