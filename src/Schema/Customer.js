const mongoose = require("mongoose");
const Address = require("./Address");
const PaymentMethod = require("./PaymentMethod");
const Subscription = require("./Subscription");
const Transaction = require("./Transaction");
const ProcessorItem = require("./ProcessorItem");
const SubscriptionStatus = require("./Statuses/SubscriptionStatus");
const DiscountPreviousSubscription = require("./Discount/PreviousSubscription");
const TransactionError = require("../TransactionError");
const originals = require("mongoose-originals");
const XDate = require("xdate");

const Customer = new mongoose.Schema({
    processor: {
        type: ProcessorItem,
        default: ProcessorItem,
    },
    ipAddress: String,
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        match: /^([\w-.+]+@([\w-]+\.)+[\w-]{2,6})?$/,
    },
    transactionStartedAt: Date,
    phone: String,
    addresses: [Address],
    paymentMethods: [PaymentMethod],
    defaultPaymentMethodId: String,
    subscriptions: [Subscription],
    transactions: [Transaction],
});

Customer.TRANSACTION_TIMEOUT = 30;

const paymentMethods = Customer.path("paymentMethods");
const transactions = Customer.path("transactions");

paymentMethods.discriminator("CreditCard", PaymentMethod.CreditCard);
paymentMethods.discriminator("PayPalAccount", PaymentMethod.PayPalAccount);
paymentMethods.discriminator("ApplePayCard", PaymentMethod.ApplePayCard);
paymentMethods.discriminator("AndroidPayCard", PaymentMethod.AndroidPayCard);

transactions.discriminator("TransactionCreditCard", Transaction.TransactionCreditCard);
transactions.discriminator("TransactionPayPalAccount", Transaction.TransactionPayPalAccount);
transactions.discriminator("TransactionApplePayCard", Transaction.TransactionApplePayCard);
transactions.discriminator("TransactionAndroidPayCard", Transaction.TransactionAndroidPayCard);

Customer.method("transactionBegin", function transactionBegin(activeDate) {
    const date = activeDate || new Date();
    if (
        this.transactionStartedAt &&
        new XDate(this.transactionStartedAt).diffSeconds(date) < Customer.TRANSACTION_TIMEOUT
    ) {
        throw new TransactionError("Another payment operation is already in progress");
    } else {
        return this.set({ transactionStartedAt: date }).save();
    }
});

Customer.method("transactionRollback", function transactionRollback(activeDate) {
    return this.resetProcessor()
        .set({ transactionStartedAt: null })
        .save();
});

Customer.method("transactionCommit", function transactionCommit(activeDate) {
    return this.set({ transactionStartedAt: null }).save();
});

Customer.method("markChanged", function markChanged() {
    if (this.processor.id && this.isModified("name email phone ipAddress defaultPaymentMethodId")) {
        this.processor.state = ProcessorItem.CHANGED;
    }

    ["addresses", "subscriptions", "paymentMethods"].forEach(collectionName => {
        this[collectionName].forEach((item, index) => {
            if (
                item.processor.id &&
                this.isModified(`${collectionName}.${index}`) &&
                item.isChanged()
            ) {
                item.processor.state = ProcessorItem.CHANGED;
            }
        });
    });

    return this;
});

Customer.method("cancelProcessor", function cancelProcessor(processor, subscriptionId) {
    this.setSnapshotOriginal();
    return processor
        .cancelSubscription(this, subscriptionId)
        .then(customer => customer.clearSnapshotOriginal().save());
});

Customer.method("refundProcessor", function refundProcessor(processor, transactionId, amount) {
    this.setSnapshotOriginal();

    return processor
        .refundTransaction(this, transactionId, amount)
        .then(customer => customer.clearSnapshotOriginal().save());
});

Customer.method("loadProcessor", function loadProcessor(processor) {
    if (!this.processor.id) {
        return this.save();
    } else {
        return processor.load(this.resetProcessor()).then(customer => customer.save());
    }
});

Customer.method("saveProcessor", function saveProcessor(processor) {
    this.setSnapshotOriginal().markChanged();
    return processor.save(this).then(customer => customer.save());
});

Customer.method("cancelSubscriptions", function cancelSubscriptions() {
    const cancaleableStatuses = [
        SubscriptionStatus.PENDING,
        SubscriptionStatus.PAST_DUE,
        SubscriptionStatus.ACTIVE,
    ];

    this.subscriptions.filter(sub => cancaleableStatuses.includes(sub.status)).forEach(sub => {
        sub.status = SubscriptionStatus.CANCELED;
    });

    return this;
});

Customer.method("resetProcessor", function resetProcessor() {
    ["addresses", "paymentMethods", "subscriptions"].forEach(name => {
        this[name] = this[name].filter(item => item.processor.state !== ProcessorItem.INITIAL);
        this[name]
            .filter(item => item.processor.state === ProcessorItem.CHANGED)
            .forEach(item => (item.processor.state = ProcessorItem.SAVED));
    });

    return this;
});

Customer.method("addAddress", function addAddress(addressData) {
    const address = this.addresses.create(addressData);
    this.addresses.push(address);

    return address;
});

Customer.method("defaultPaymentMethod", function defaultPaymentMethod() {
    return this.paymentMethods.id(this.defaultPaymentMethodId);
});

Customer.method("getUnusedAddress", function getUnusedAddress() {
    return this.addresses.find(address => {
        return !this.paymentMethods.find(
            paymentMethod => paymentMethod.billingAddressId === address.id
        );
    });
});

Customer.method("setDefaultPaymentMethod", function setDefaultPaymentMethod(
    paymentMethodData,
    addressData
) {
    const current = this.defaultPaymentMethod();
    let paymentMethod;

    // Modify an existing payment method if its the same type and is not Paypal
    if (current && paymentMethodData.__t === current.__t && current.__t !== "PayPalAccount") {
        paymentMethod = Object.assign(current, paymentMethodData);
    } else {
        // Reuse the billing address of the previous payment method
        paymentMethod = this.paymentMethods.create(
            Object.assign(
                current ? { billingAddressId: current.billingAddressId } : {},
                paymentMethodData
            )
        );
        this.paymentMethods.push(paymentMethod);
    }

    this.defaultPaymentMethodId = paymentMethod._id;

    if (addressData) {
        this.setDefaultPaymentMethodAddress(addressData);
    }

    return paymentMethod;
});

Customer.method("setDefaultPaymentMethodAddress", function setDefaultPaymentMethodAddress(
    addressData
) {
    const current = this.defaultPaymentMethod();
    const currentAddress = (current && current.billingAddress()) || this.getUnusedAddress();

    let address;

    if (currentAddress) {
        address = Object.assign(currentAddress, addressData);
    } else {
        address = this.addresses.create(addressData);
        this.addresses.push(address);
    }

    if (current && address._id) {
        current.billingAddressId = address._id;
    }

    return address;
});

Customer.method("addPaymentMethodNonce", function addPaymentMethodNonce(nonce, address) {
    const paymentMethod = this.paymentMethods.create({
        nonce: nonce,
    });

    if (address) {
        paymentMethod.billingAddressId = address._id;
    }

    this.paymentMethods.push(paymentMethod);
    this.defaultPaymentMethodId = paymentMethod._id;

    return paymentMethod;
});

Customer.method("addSubscription", function addSubscription(plan, paymentMethod, activeDate) {
    const date = activeDate || new Date();
    const nonTrialSubs = this.validSubscriptions(date).filter(
        item => !(item.isTrial && item.processor.state === ProcessorItem.LOCAL)
    );

    const waitForSubs = this.validSubscriptions(date)
        .filter(
            item => item.plan.level >= plan.level && item.status !== SubscriptionStatus.PAST_DUE
        )
        .sort((a, b) => (b.billingPeriodEndDate < a.billingPeriodEndDate ? -1 : 1));

    const refundableSubs = nonTrialSubs
        .filter(item => item.plan.level < plan.level)
        .filter(item => item.processor.state !== ProcessorItem.LOCAL);

    let subscription = this.subscriptions.create({
        plan,
        firstBillingDate: waitForSubs.length
            ? waitForSubs[0].isTrial
              ? waitForSubs[0].firstBillingDate
              : waitForSubs[0].billingPeriodEndDate
            : null,
        price: plan.price,
    });

    if (!waitForSubs.length) {
        subscription = subscription.addDiscounts(newSub => [
            DiscountPreviousSubscription.build(newSub, refundableSubs[0], activeDate),
        ]);
    }

    if (paymentMethod) {
        subscription.paymentMethodId = paymentMethod._id;
    }

    this.subscriptions.push(subscription);

    return subscription;
});

Customer.method("activeSubscriptions", function activeSubscriptions(activeDate) {
    return this.validSubscriptions(activeDate).filter(
        item => item.status === SubscriptionStatus.ACTIVE
    );
});

Customer.method("validSubscriptions", function validSubscriptions(activeDate) {
    const date = activeDate || new Date();

    return this.subscriptions
        .filter(item => !item.deleted)
        .filter(item => item.inBillingPeriod(date))
        .filter(item => item.processor.isActive())
        .sort((a, b) => {
            return b.plan.level === a.plan.level
                ? b.billingPeriodEndDate < a.billingPeriodEndDate ? -1 : 1
                : b.plan.level - a.plan.level;
        });
});

Customer.method("subscription", function subscription(activeDate) {
    return this.validSubscriptions(activeDate)[0];
});

Customer.plugin(originals, {
    fields: ["ipAddress", "name", "email", "phone", "defaultPaymentMethodId"],
});

module.exports = Customer;
