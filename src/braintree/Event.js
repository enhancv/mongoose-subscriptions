const CUSTOMER = 'customer';
const PAYMENT_METHOD = 'paymentMethod';
const ADDRESS = 'address';
const SUBSCRIPTION = 'subscription';
const TRANSACTION = 'transaction';
const PLAN = 'plan';

const SAVED = 'save';
const LOADING = 'loading';
const LOADED = 'loaded';
const CREATING = 'creating';
const UPDATING = 'updating';

class Event {
    constructor (objectName, action, context) {
        this.objectName = objectName;
        this.action = action;
        this.context = context;
    }
}

Event.CUSTOMER = CUSTOMER;
Event.PAYMENT_METHOD = PAYMENT_METHOD;
Event.ADDRESS = ADDRESS;
Event.SUBSCRIPTION = SUBSCRIPTION;
Event.TRANSACTION = TRANSACTION;
Event.PLAN = PLAN;

Event.SAVED = 'saved';
Event.LOADED = 'loaded';

module.exports = Event;
