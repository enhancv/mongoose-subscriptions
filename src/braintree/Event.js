const CUSTOMER = 'customer';
const PAYMENT_METHOD = 'paymentMethod';
const ADDRESS = 'address';
const SUBSCRIPTION = 'subscription';
const TRANSACTION = 'transaction';
const PLAN = 'plan';

const LOADING = 'loading';
const LOADED = 'loaded';

const CREATING = 'creating';
const UPDATING = 'updating';
const SAVED = 'saved';

const CANCELING = 'canceling';
const CANCELED = 'canceled';

const REFUND = 'refund';
const REFUNDED = 'refund';

class Event {
    constructor (name, action, context) {
        this.name = name;
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

Event.LOADED = LOADED;
Event.LOADING = LOADING;
Event.CREATING = CREATING;
Event.UPDATING = UPDATING;
Event.SAVED = SAVED;
Event.CANCELING = CANCELING;
Event.CANCELED = CANCELED;
Event.REFUND = REFUND;
Event.REFUNDED = REFUNDED;

module.exports = Event;
