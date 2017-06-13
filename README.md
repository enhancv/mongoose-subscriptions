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

License
-------

Copyright (c) 2016-2017 Enhancv
Licensed under the MIT license.

