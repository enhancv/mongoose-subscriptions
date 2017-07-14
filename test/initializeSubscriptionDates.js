const addmonths = require("addmonths");
const adddays = require("../src/adddays");
const startofday = require("../src/startofday");

function initializeSubscriptionDays(sub) {
    sub.firstBillingDate = startofday(sub.firstBillingDate || sub.createdAt);
    sub.paidThroughDate =
        sub.paidThroughDate ||
        startofday(addmonths(sub.firstBillingDate, sub.plan.billingFrequency));
    sub.billingPeriodStartDate = sub.billingPeriodStartDate || sub.firstBillingDate;
    sub.billingPeriodEndDate = sub.billingPeriodEndDate || sub.paidThroughDate;
    sub.nextBillingDate = sub.nextBillingDate || adddays(sub.paidThroughDate, 1);
    sub.billingDayOfMonth = sub.billingDayOfMonth || sub.nextBillingDate.getDate();

    return sub;
}

module.exports = initializeSubscriptionDays;
