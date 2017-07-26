const XDate = require("xdate");

function initializeSubscriptionDates(sub) {
    sub.firstBillingDate = new XDate(sub.firstBillingDate || sub.createdAt, true).clearTime();

    if (!sub.isTrial) {
        sub.paidThroughDate =
            sub.paidThroughDate ||
            new XDate(sub.firstBillingDate, true).addMonths(sub.plan.billingFrequency).clearTime();
        sub.nextBillingDate = sub.nextBillingDate || new XDate(sub.paidThroughDate).addDays(1);
        sub.billingPeriodStartDate = sub.billingPeriodStartDate || sub.firstBillingDate;
        sub.billingPeriodEndDate = sub.billingPeriodEndDate || sub.paidThroughDate;
        sub.billingDayOfMonth = sub.billingDayOfMonth || sub.nextBillingDate.getDate();
    } else {
        sub.nextBillingDate = this.nextBillingDate || this.firstBillingDate;
    }

    return sub;
}

module.exports = initializeSubscriptionDates;
