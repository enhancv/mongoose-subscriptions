const XDate = require("xdate");

function initializeSubscriptionDays(sub) {
    sub.firstBillingDate = new XDate(sub.firstBillingDate || sub.createdAt, true).clearTime();
    sub.paidThroughDate =
        sub.paidThroughDate ||
        new XDate(sub.firstBillingDate, true).addMonths(sub.plan.billingFrequency).clearTime();
    sub.billingPeriodStartDate = sub.billingPeriodStartDate || sub.firstBillingDate;
    sub.billingPeriodEndDate = sub.billingPeriodEndDate || sub.paidThroughDate;
    sub.nextBillingDate = sub.nextBillingDate || new XDate(sub.paidThroughDate).addDays(1);
    sub.billingDayOfMonth = sub.billingDayOfMonth || sub.nextBillingDate.getDate();

    return sub;
}

module.exports = initializeSubscriptionDays;
