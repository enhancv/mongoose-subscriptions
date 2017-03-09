const addressProcessor = require('./address');
const customerProcessor = require('./customer');
const paymentMethodProcessor = require('./paymentMethod');
const subscriptionProcessor = require('./subscription');
const transactionProcessor = require('./transaction');
const set = require('lodash/fp/set');

function sync (gateway, customer) {
    return customer
        .markChanged()
        .save()
        .then(customer => {
            console.log('CUSTOMER');

            return customerProcessor(gateway, customer)
        })
        .then(customer => {
            console.log('ADDRESSES');

            return Promise
                .all(customer.addresses.map(address => addressProcessor(gateway, customer, address)))
                .then((addresses) => set('addresses', addresses, customer));
        }).then(customer => {
            console.log('PAYMENT METHODS');

            return Promise
                .all(customer.paymentMethods.map(paymentMethod => paymentMethodProcessor(gateway, customer, paymentMethod)))
                .then((paymentMethods) => set('paymentMethods', paymentMethods, customer));
        }).then(customer => {
            console.log('SUBSCRIPTIONS');

            return Promise
                .all(customer.subscriptions.map(subscription => subscriptionProcessor(gateway, customer, subscription)))
                .then((subscriptions) => set('subscriptions', subscriptions, customer));
        }).then(customer => {
            console.log('TRANSACTIONS');
            return transactionProcessor.sync(gateway, customer).then(transactions => set('transactions', transactions, customer))
        });
}

module.exports = {
    sync: sync,
}
