Mongoose Subscriptions
======================

[![Build Status](https://travis-ci.org/enhancv/mongoose-subscriptions.svg?branch=master)](https://travis-ci.org/enhancv/mongoose-subscriptions)
[![Code Climate](https://codeclimate.com/github/enhancv/mongoose-subscriptions/badges/gpa.svg)](https://codeclimate.com/github/enhancv/mongoose-subscriptions)
[![Test Coverage](https://codeclimate.com/github/enhancv/mongoose-subscriptions/badges/coverage.svg)](https://codeclimate.com/github/enhancv/mongoose-subscriptions/coverage)

Processor agnostic payment subscription backend. It provides some premitive mongoose models to model subscriptions, namely **Customer** and **Coupon** and, by using an adapter syncs the state in the database to the state in the payment subscription, transparently updating payment methods, subscriptions, trials and promotions.

It works both ways. You can make changes to your **Customer** and execute "saveProcessor", propogating it to the payment processor. Or you can execute "loadProcessor" and get the latest state in the db.

Installation
------------

```
yarn add mongoose-subscriptions
```

You'll also need a specific processor driver. Currently only supported is braintree

```
yarn add mongoose-subscriptions-braintree
```

Usage
-----
You can use the **Customer** model directly:

```javascript
const ms = require('mongoose-subscriptions');
const customer = new ms.Customer({ ... });
```

You can also extend **CustomerSchema** with more fields and use that as your own model:

```javascript
const ms = require('mongoose-subscriptions');
const UserSchema = ms.Schema.Customer.add({
    userAgent: String,
    photo: String,
    hashedPassword: String,
});
const User = mongoose.model('User', UserSchema);
```

Structure
---------
┌──────────────────┐
│     Customer     │
└┬┬┬┬┬─────────────┘
 │││││     ┌────────────────────────┐
 ││││└────▶│       [Address]        │
 ││││      └────────────────────────┘
 ││││    ┌────────────────────────┐
 │││└───▶│    [Payment Method]    │
 │││     └────────────────────────┘
 │││   ┌────────────────────────┐
 ││└──▶│     [Subscription]     │
 ││    └────────────────────────┘
 ││  ┌────────────────────────┐
 │└─▶│     [Transaction]      │
 │   └────────────────────────┘
 │  ┌────────────────────────┐
 └─▶│ defaultPaymentMethodId │
    └────────────────────────┘

All the connections between objects are done with internal local ids, without using the ids from the payment processor. This way you can establish relationships between objects even before they are sent there.

```javascript
const customer = new Customer({
    name: "John DOe",
    email: "john@example.com",
    subscriptions: [
        {
            paymentMethodId: "test-pay",
            plan: {
                price: 4.99,
                processorId: "basic",
                level: 1,
                billingFrequency: 1,
            },
        },
    ],
    paymentMethods: [
        {
            _id: "test-pay",
            billingAddressId: 'addr-1',
            nonce: "some-nonce",
        },
    ],
    defaultPaymentMethodId: "test-pay",
    addresses: [
        {
            _id: 'addr-1',
            phone: '1-3232-123-323',
            name: 'John Doe',
            country: 'United States',
            locality: 'Florida',
            streetAddress: 'Monti 1',
            postalCode: 'NX032',
        }
    ].
});
```

Braintree
---------

To sync with braintree you'll need to use the `mongoose-subscriptions-braintree` package.

```
const braintree = require("braintree");
const Processor = require("mongoose-subscriptions-braintree");

// Provide an array of plan objects to be used by the processor
// processorId is the id of the plan in braintree,
// and level is the precedence of the plan, this goes in effect,
// whenever someone has more than one subscription active.
const plans = [{
    processorId: 'plan1',
    price: 9.35,
    billingFrequency: 1,
    level: 1,
}];

const gateway = braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantId: ...,
    publicKey: ...,
    privateKey: ...,
});

const processor new Processor(gateway, plans);

const address = customer.addAddress({ ... });
const paymentMethod = customer.addPaymentMethodNonce(nonce, address);

customer.saveProcessor(processor).then(() => {
    console.log('Saved in braintree');
});
```

License
-------

Copyright (c) 2016-2017 Enhancv
Licensed under the MIT license.

