'use strict';

const assert = require('assert');
const sinon = require('sinon');
const Customer = require('../../src/Customer');
const ProcessorItem = require('../../src/Schema/ProcessorItem');
const transactionProcessor = require('../../src/braintree/transactionProcessor');

describe('transactionProcessor', function () {
    beforeEach(function () {
        this.customer = new Customer({
            name: 'Pesho',
            email: 'seer@example.com',
            ipAddress: '10.0.0.2',
            processor: { id: '64601260', state: 'saved' },
            defaultPaymentMethodId: 'three',
            addresses: [
                {
                    _id: 'one',
                    processor: { id: 'fc', state: 'saved' },
                    firstName: 'Pesho', lastName: 'Stanchev',
                },
            ],
            paymentMethods: [
                {
                    _id: 'three',
                    __t: 'CreditCard',
                    billingAddressId: 'one',
                    processor: { id: 'gpjt3m', state: 'saved' },
                },
            ],
            subscriptions: [
                {
                    _id: 'four',
                    plan: 'test',
                    status: 'Active',
                    descriptor: {
                        name: 'Tst*Mytest',
                        phone: 8899039032,
                        url: 'example.com',
                    },
                    paymentMethodId: 'three',
                    processor: { id: 'gzsxjb', state: 'saved' },
                },
            ]
        });

        this.transactionPayPal = {
            "id" : "7jflk342",
            "status" : "settled",
            "type" : "sale",
            "currencyIsoCode" : "USD",
            "amount" : "14.90",
            "merchantAccountId" : "exampleUSD",
            "subMerchantAccountId" : null,
            "masterMerchantAccountId" : null,
            "orderId" : null,
            "createdAt" : "2016-08-31T10:39:00Z",
            "updatedAt" : "2016-08-31T14:03:31Z",
            "customer" : {
                "id" : "408622798",
                "firstName" : "Pesho",
                "lastName" : "Peshev",
                "company" : null,
                "email" : "marinov1002@example.com",
                "website" : null,
                "phone" : "+359887111111",
                "fax" : null
            },
            "billing" : {
                "id" : null,
                "firstName" : null,
                "lastName" : null,
                "company" : null,
                "streetAddress" : null,
                "extendedAddress" : null,
                "locality" : null,
                "region" : null,
                "postalCode" : null,
                "countryName" : null,
                "countryCodeAlpha2" : null,
                "countryCodeAlpha3" : null,
                "countryCodeNumeric" : null
            },
            "refundId" : null,
            "refundIds" : [],
            "refundedTransactionId" : null,
            "partialSettlementTransactionIds" : [],
            "authorizedTransactionId" : null,
            "settlementBatchId" : "2016-08-31_exampleUSD_2",
            "shipping" : {
                "id" : null,
                "firstName" : null,
                "lastName" : null,
                "company" : null,
                "streetAddress" : null,
                "extendedAddress" : null,
                "locality" : null,
                "region" : null,
                "postalCode" : null,
                "countryName" : null,
                "countryCodeAlpha2" : null,
                "countryCodeAlpha3" : null,
                "countryCodeNumeric" : null
            },
            "customFields" : "",
            "avsErrorResponseCode" : null,
            "avsPostalCodeResponseCode" : "I",
            "avsStreetAddressResponseCode" : "I",
            "cvvResponseCode" : "I",
            "gatewayRejectionReason" : null,
            "processorAuthorizationCode" : null,
            "processorResponseCode" : "1000",
            "processorResponseText" : "Approved",
            "additionalProcessorResponse" : null,
            "voiceReferralNumber" : null,
            "purchaseOrderNumber" : null,
            "taxAmount" : null,
            "taxExempt" : false,
            "creditCard" : {
                "token" : "f3326t2",
                "bin" : null,
                "last4" : null,
                "cardType" : null,
                "expirationMonth" : "",
                "expirationYear" : "",
                "customerLocation" : null,
                "cardholderName" : null,
                "imageUrl" : "https://assets.braintreegateway.com/payment_method_logo/unknown.png?environment=production",
                "prepaid" : "Unknown",
                "healthcare" : "Unknown",
                "debit" : "Unknown",
                "durbinRegulated" : "Unknown",
                "commercial" : "Unknown",
                "payroll" : "Unknown",
                "issuingBank" : "Unknown",
                "countryOfIssuance" : "Unknown",
                "productId" : "Unknown",
                "uniqueNumberIdentifier" : null,
                "venmoSdk" : false,
                "maskedNumber" : "null******null",
                "expirationDate" : "/"
            },
            "statusHistory" : [
                {
                    "timestamp" : "2016-08-31T10:39:04Z",
                    "status" : "authorized",
                    "amount" : "14.90",
                    "user" : "kerin@example.com",
                    "transactionSource" : "recurring"
                },
                {
                    "timestamp" : "2016-08-31T10:39:04Z",
                    "status" : "submitted_for_settlement",
                    "amount" : "14.90",
                    "user" : "kerin@example.com",
                    "transactionSource" : "recurring"
                },
                {
                    "timestamp" : "2016-08-31T10:39:08Z",
                    "status" : "settling",
                    "amount" : "14.90",
                    "user" : "kerin@example.com",
                    "transactionSource" : "recurring"
                },
                {
                    "timestamp" : "2016-08-31T14:03:31Z",
                    "status" : "settled",
                    "amount" : "14.90",
                    "user" : null,
                    "transactionSource" : ""
                }
            ],
            "planId" : "monthly",
            "subscriptionId" : "gzsxjb",
            "subscription" : {
                "billingPeriodEndDate" : "2016-09-29",
                "billingPeriodStartDate" : "2016-08-31"
            },
            "addOns" : [],
            "discounts" : [
                {
                    "amount" : "0.00",
                    "currentBillingCycle" : 1,
                    "id" : "promocode",
                    "name" : "Signup promocode",
                    "neverExpires" : false,
                    "numberOfBillingCycles" : 1,
                    "quantity" : 1
                }
            ],
            "descriptor" : {
                "name" : "example*Pro Plan",
                "phone" : "0888415433",
                "url" : "example.com"
            },
            "recurring" : true,
            "channel" : null,
            "serviceFeeAmount" : null,
            "escrowStatus" : null,
            "disbursementDetails" : {
                "disbursementDate" : null,
                "settlementAmount" : null,
                "settlementCurrencyIsoCode" : null,
                "settlementCurrencyExchangeRate" : null,
                "fundsHeld" : null,
                "success" : null
            },
            "disputes" : [],
            "paymentInstrumentType" : "paypal_account",
            "processorSettlementResponseCode" : "4000",
            "processorSettlementResponseText" : "Confirmed",
            "threeDSecureInfo" : null,
            "paypal" : {
                "token" : "f3326t2",
                "payerEmail" : "f0rceman@example.com",
                "paymentId" : "PAY-DSFHJKDSHFLKJHSDFLKJS",
                "authorizationId" : "8FD90FA@E@JFKLD",
                "imageUrl" : "https://assets.braintreegateway.com/payment_method_logo/paypal.png?environment=production",
                "debugId" : "111166bed8b83",
                "payeeEmail" : null,
                "customField" : null,
                "payerId" : "HX2WMHJKFDF902",
                "payerFirstName" : "Pesho",
                "payerLastName" : "Peshev",
                "sellerProtectionStatus" : "INELIGIBLE",
                "captureId" : "89403294802930423",
                "refundId" : null,
                "transactionFeeAmount" : "0.81",
                "transactionFeeCurrencyIsoCode" : "USD",
                "description" : null
            },
            "paypalAccount" : {
                "token" : "f3326t2",
                "payerEmail" : "f0rceman@example.com",
                "paymentId" : "PAY-DSFHJKDSHFLKJHSDFLKJS",
                "authorizationId" : "8FD90FA@E@JFKLD",
                "imageUrl" : "https://assets.braintreegateway.com/payment_method_logo/paypal.png?environment=production",
                "debugId" : "111166bed8b83",
                "payeeEmail" : null,
                "customField" : null,
                "payerId" : "HX2WMHJKFDF902",
                "payerFirstName" : "Pesho",
                "payerLastName" : "Peshev",
                "sellerProtectionStatus" : "INELIGIBLE",
                "captureId" : "89403294802930423",
                "refundId" : null,
                "transactionFeeAmount" : "0.81",
                "transactionFeeCurrencyIsoCode" : "USD",
                "description" : null
            },
            "coinbaseAccount" : {},
            "applePayCard" : {},
            "androidPayCard" : {}
        };

        this.fieldsPayPal = {
            _id: '7jflk342',
            processor: { id: '7jflk342', state: 'saved' },
            amount: '14.90',
            subscriptionId: 'four',
            planProcessorId: 'monthly',
            billing: {
                processor: { id: null, state: 'saved' },
                name: '',
                company: null,
                createdAt: undefined,
                updatedAt: undefined,
                country: null,
                locality: null,
                streetAddress: null,
                extendedAddress: null,
                postalCode: null
            },
            customer: {
                name: 'Pesho Peshev',
                company: null,
                email: 'marinov1002@example.com',
                phone: '+359887111111',
            },
            discounts: [
                {
                    amount: 0.00,
                    __t: "promocode",
                    name: "Signup promocode",
                }
            ],
            currency: 'USD',
            status: 'settled',
            statusHistory: [
                {
                    timestamp: '2016-08-31T10:39:04Z',
                    status: 'authorized',
                    amount: '14.90',
                    user: 'kerin@example.com',
                    transactionSource: 'recurring'
                },
                {
                    timestamp: '2016-08-31T10:39:04Z',
                    status: 'submitted_for_settlement',
                    amount: '14.90',
                    user: 'kerin@example.com',
                    transactionSource: 'recurring'
                },
                {
                    timestamp: '2016-08-31T10:39:08Z',
                    status: 'settling',
                    amount: '14.90',
                    user: 'kerin@example.com',
                    transactionSource: 'recurring'
                },
                {
                    timestamp: '2016-08-31T14:03:31Z',
                    status: 'settled',
                    amount: '14.90',
                    user: null,
                    transactionSource: ''
                }
            ],
            descriptor: {
                name: 'example*Pro Plan',
                phone: '0888415433',
                url: 'example.com'
            },
            createdAt: '2016-08-31T10:39:00Z',
            updatedAt: '2016-08-31T14:03:31Z',
            __t: 'TransactionPayPalAccount',
            name: 'Pesho Peshev',
            payerId: 'HX2WMHJKFDF902',
            email: 'f0rceman@example.com',
        };

        this.transactionCreditCardRefunded = {
            "id" : "9sc4zwjf",
            "status" : "settled",
            "type" : "credit",
            "currencyIsoCode" : "USD",
            "amount" : "14.90",
            "merchantAccountId" : "exampleUSD",
            "subMerchantAccountId" : null,
            "masterMerchantAccountId" : null,
            "orderId" : null,
            "createdAt" : "2016-08-03T13:09:58Z",
            "updatedAt" : "2016-08-03T23:40:08Z",
            "customer" : {
                "id" : "264704707",
                "firstName" : "Pesho",
                "lastName" : "Peshev",
                "company" : null,
                "email" : "keeletsang@example.com",
                "website" : null,
                "phone" : "11111111111",
                "fax" : null
            },
            "billing" : {
                "id" : "dz",
                "firstName" : "Pesho",
                "lastName" : "Peshev",
                "company" : null,
                "streetAddress" : "Flat 3",
                "extendedAddress" : "71 - 72 Princes Gate",
                "locality" : "Black Lake",
                "region" : null,
                "postalCode" : "BLK120",
                "countryName" : "United Kingdom",
                "countryCodeAlpha2" : "GB",
                "countryCodeAlpha3" : "GBR",
                "countryCodeNumeric" : "826"
            },
            "refundId" : null,
            "refundIds" : [],
            "refundedTransactionId" : "ey46ey2b",
            "partialSettlementTransactionIds" : [],
            "authorizedTransactionId" : null,
            "settlementBatchId" : "2016-08-04_exampleUSD",
            "shipping" : {
                "id" : null,
                "firstName" : null,
                "lastName" : null,
                "company" : null,
                "streetAddress" : null,
                "extendedAddress" : null,
                "locality" : null,
                "region" : null,
                "postalCode" : null,
                "countryName" : null,
                "countryCodeAlpha2" : null,
                "countryCodeAlpha3" : null,
                "countryCodeNumeric" : null
            },
            "customFields" : "",
            "avsErrorResponseCode" : null,
            "avsPostalCodeResponseCode" : "A",
            "avsStreetAddressResponseCode" : "A",
            "cvvResponseCode" : "A",
            "gatewayRejectionReason" : null,
            "processorAuthorizationCode" : null,
            "processorResponseCode" : "1002",
            "processorResponseText" : "Processed",
            "additionalProcessorResponse" : null,
            "voiceReferralNumber" : null,
            "purchaseOrderNumber" : null,
            "taxAmount" : null,
            "taxExempt" : false,
            "creditCard" : {
                "token" : "7mzhnp2",
                "bin" : "411111",
                "last4" : "1111",
                "cardType" : "Visa",
                "expirationMonth" : "07",
                "expirationYear" : "2018",
                "customerLocation" : "International",
                "cardholderName" : null,
                "imageUrl" : "https://assets.braintreegateway.com/payment_method_logo/visa.png?environment=production",
                "prepaid" : "No",
                "healthcare" : "No",
                "debit" : "Yes",
                "durbinRegulated" : "No",
                "commercial" : "Unknown",
                "payroll" : "No",
                "issuingBank" : "HSBC Bank PLC",
                "countryOfIssuance" : "GBR",
                "productId" : "F",
                "uniqueNumberIdentifier" : "75a85af754be161e21ffb8d584c70de8",
                "venmoSdk" : false,
                "maskedNumber" : "411111******1111",
                "expirationDate" : "07/2018"
            },
            "statusHistory" : [
                {
                    "timestamp" : "2016-08-03T13:09:59Z",
                    "status" : "submitted_for_settlement",
                    "amount" : "14.90",
                    "user" : "dachev@example.com",
                    "transactionSource" : "control_panel"
                },
                {
                    "timestamp" : "2016-08-03T23:42:01Z",
                    "status" : "settled",
                    "amount" : "14.90",
                    "user" : null,
                    "transactionSource" : ""
                }
            ],
            "planId" : null,
            "subscriptionId" : "gzsxjb",
            "subscription" : {
                "billingPeriodEndDate" : null,
                "billingPeriodStartDate" : null
            },
            "addOns" : [],
            "discounts" : [],
            "descriptor" : {
                "name" : null,
                "phone" : null,
                "url" : null
            },
            "recurring" : null,
            "channel" : null,
            "serviceFeeAmount" : null,
            "escrowStatus" : null,
            "disbursementDetails" : {
                "disbursementDate" : null,
                "settlementAmount" : null,
                "settlementCurrencyIsoCode" : null,
                "settlementCurrencyExchangeRate" : null,
                "fundsHeld" : null,
                "success" : null
            },
            "disputes" : [],
            "paymentInstrumentType" : "credit_card",
            "processorSettlementResponseCode" : "",
            "processorSettlementResponseText" : "",
            "threeDSecureInfo" : null,
            "paypalAccount" : {},
            "coinbaseAccount" : {},
            "applePayCard" : {},
            "androidPayCard" : {}
        };

        this.fieldsCreditCardRefunded = {
            _id: '9sc4zwjf',
            processor: {
                id: '9sc4zwjf',
                state: 'saved'
            },
            amount: '14.90',
            refundedTransactionId: 'ey46ey2b',
            subscriptionId: 'four',
            billing: {
                processor: {
                    id: 'dz',
                    state: 'saved'
                },
                name: 'Pesho Peshev',
                company: null,
                createdAt: undefined,
                updatedAt: undefined,
                country: 'GB',
                locality: 'Black Lake',
                streetAddress: 'Flat 3',
                extendedAddress: '71 - 72 Princes Gate',
                postalCode: 'BLK120'
            },
            customer: {
                name: 'Pesho Peshev',
                company: null,
                email: 'keeletsang@example.com',
                phone: '11111111111',
            },
            currency: 'USD',
            status: 'settled',
            statusHistory: [{
                    timestamp: '2016-08-03T13:09:59Z',
                    status: 'submitted_for_settlement',
                    amount: '14.90',
                    user: 'dachev@example.com',
                    transactionSource: 'control_panel'
                },
                {
                    timestamp: '2016-08-03T23:42:01Z',
                    status: 'settled',
                    amount: '14.90',
                    user: null,
                    transactionSource: ''
                }
            ],
            discounts: [],
            descriptor: {
                name: null,
                phone: null,
                url: null
            },
            createdAt: '2016-08-03T13:09:58Z',
            updatedAt: '2016-08-03T23:40:08Z',
            __t: 'TransactionCreditCard',
            maskedNumber: '411111******1111',
            countryOfIssuance: 'GBR',
            issuingBank: 'HSBC Bank PLC',
            cardType: 'Visa',
            expirationMonth: '07',
            expirationYear: '2018',
        };
    });

    it('fields should map result data into a model', function () {
        const fields = transactionProcessor.fields(this.customer, this.transactionPayPal);
        assert.deepEqual(fields, this.fieldsPayPal);
    });

    it('fields should map credit card transaction data into a model', function () {
        const fields = transactionProcessor.fields(this.customer, this.transactionCreditCardRefunded);
        assert.deepEqual(fields, this.fieldsCreditCardRefunded);
    });
});
