const mongoose = require("mongoose");
const Coupon = require("../../Coupon");
const ProcessorItem = require("../ProcessorItem");

const Schema = mongoose.Schema;

/**
 * Coupon Discount
 */
const DiscountCouponRestricted = new Schema(
    {
        coupon: {
            type: Schema.Types.ObjectId,
            ref: "Coupon",
            required: true,
        },
        customerId: {
            type: Schema.Types.ObjectId,
        },
    },
    { _id: false }
);

DiscountCouponRestricted.build = function build(customer, subscription, coupon, currentDate) {
    if (Coupon.validateState(coupon, currentDate)) {
        return null;
    }

    if (coupon.uses.id(customer._id)) {
        return null;
    }

    const amount = coupon.currentAmount(subscription);

    if (!amount) {
        return null;
    }

    return {
        coupon,
        amount: amount.toFixed(2),
        numberOfBillingCycles: coupon.numberOfBillingCycles,
        __t: "DiscountCouponRestricted",
        customerId: customer._id,
        name: coupon.name,
    };
};

DiscountCouponRestricted.pre("save", function preSave(next) {
    if (this.coupon && this.customerId && this.isAddedToProcessor) {
        const couponFind =
            this.coupon instanceof Coupon
                ? Promise.resolve(this.coupon)
                : Coupon.findById(this.coupon);

        couponFind.then(coupon => {
            const customer = this.ownerDocument();
            if (!coupon.uses.id(this.customerId)) {
                coupon.usedCount += 1;
                coupon.uses.push({ _id: this.customerId, createdAt: new Date() });
                coupon.save(next);
            } else {
                next();
            }
        });
    } else {
        next();
    }
});

module.exports = DiscountCouponRestricted;
