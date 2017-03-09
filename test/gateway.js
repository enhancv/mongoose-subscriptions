'use strict';

const braintree = require('braintree');
const promised = require('braintree-as-promised');
const dotenv = require('dotenv');

const gateway = braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY
});

module.exports = promised(gateway);
