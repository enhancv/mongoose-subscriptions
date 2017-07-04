Mongoose Subscriptions
======================

[![Build Status](https://travis-ci.org/enhancv/mongoose-subscriptions.svg?branch=master)](https://travis-ci.org/enhancv/mongoose-subscriptions)
[![Code Climate](https://codeclimate.com/github/enhancv/mongoose-subscriptions/badges/gpa.svg)](https://codeclimate.com/github/enhancv/mongoose-subscriptions)
[![Test Coverage](https://codeclimate.com/github/enhancv/mongoose-subscriptions/badges/coverage.svg)](https://codeclimate.com/github/enhancv/mongoose-subscriptions/coverage)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

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
```
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
```

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

```javascript
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

High Level Api
--------------

**Customer methods**

Methods that change the state of the object itself.

| Method                                                  | Description                             |
| --------------------------------------------------------| ----------------------------------------|
| `.cancelSubscriptions()`                                | Set all active subscriptions to canceled |
| `.addAddress(addressData)`                              | Add an address and returns the newly added address object |
| `.defaultPaymentMethod()`                               | Get the default payment method object |
| `.addPaymentMethodNonce(nonce, [address])`              | Add a new payment method based on a nonce, optionally providing an address to assign to the payment method. Will set it as the default payment method. |
| `.setDefaultPaymentMethod(paymentMethod, [address])`    | Create or update the current default payment method, along with its billing data information. If the type of the payment method is different, a new payment method will be created. If there is no default payment method, will try to find an unused address to reuse, instead of creating a new one each time. |
| `.addSubscription(plan, [paymentMethod], [activeDate])` | Add a subscription for a given plan, optionally providing a paymentMethod to assign to it. Takes into account current subscriptions, if there are subs that are greater or equal level, will set up the firstBillingDate to start after the last sub. For lower level subs, will discount the new sub with the amount left from the existing subs. Optionally add a third argument "activeDate" that will be used as a "new Date()" calculations |
| `.activeSubscriptions(activeDate)`                      | Return all subscriptions that currently have active state |
| `.validSubscriptions(activeDate)`                       | Return all subs that are active based on firstBillingDate and paidThroughDate. Exclude all the subs that have not had an active status ever, and order by largest level first |
| `.subscription(activeDate)`                             | Return the first object from validSubscriptions |

Methods that change the state in the processor (e.g. braintree). Take `processor` as a first argument.

| Method                                                  | Description                             |
| --------------------------------------------------------| ----------------------------------------|
| `.cancelProcessor(processor, subscriptionId)`           | perform a subscription cancel and load the result into the current customer |
| `.refundProcessor(processor, transactionId, [amount])`  | perform a full refund on a given transaciton, or a partial refund if "amount" is passed. |
| `.loadProcessor(processor)`                             | load all the data about the customer (subs, transactions, payment methods) from the processor |
| `.saveProcessor(processor)`                             | save the current state of the customer object in the processor, creating addresses, payment methods and subscriptions, potentially doing transactions. |

**Coupon methods**

| Method                                                  | Description                             |
| --------------------------------------------------------| ----------------------------------------|
| `coupon.isExpired(currentDate)`                         | Check if the coupon has expireAt field set and its in the future |
| `coupon.isPending(currentDate)`                         | Check if the coupon has startAt field set and its in the past |
| `coupon.isUseLimitReached()`                            | Check if the usedCountMax is set and is larger or equal to usedCount |
| `Coupon.validateState(coupon, currentDate)`             | Check if all the coupon validation checks pass, and returns an error object if any issue is found |
| `Coupon.findOneAndValidate(query)`                      | Perform a findOne and then validateState on the resulted coupon, making sure we get a valid Coupon object. |

**Subscription subdocument methods**

| Method                                                  | Description                             |
| --------------------------------------------------------| ----------------------------------------|
| `.hasActiveStatus`                                      | A boolean virtual attribute that return true if this subscription has ever had an "Active" status |
| `nextBillingDate`                                       | A virtual setter / getter for paidThroughDate |
| `addDiscounts(callback)`                                | The result of the callback must return an array of discounts. It will go through the new discount and the ones already present on the subscription and will leave only one discount with the largest amount |

License
-------

Copyright (c) 2016-2017 Enhancv
Licensed under the MIT license.

