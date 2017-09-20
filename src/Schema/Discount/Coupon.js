const mongoose = require("mongoose");
const Coupon = require("../../Coupon");

const Schema = mongoose.Schema;

/**
 * Coupon Discount
 */
const DiscountCoupon = new Schema(
    {
        coupon: {
            type: Schema.Types.ObjectId,
            ref: "Coupon",
            required: true,
        },
    },
    { _id: false }
);

DiscountCoupon.build = function build(subscription, coupon, currentDate) {
    if (Coupon.validateState(coupon, currentDate)) {
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
        __t: "DiscountCoupon",
        name: coupon.name,
    };
};

DiscountCoupon.pre("save", function preSave(next) {
    if (this.coupon && this.isAddedToProcessor) {
        const couponFind =
            this.coupon instanceof Coupon
                ? Promise.resolve(this.coupon)
                : Coupon.findById(this.coupon);

        couponFind.then(coupon => {
            coupon.usedCount += 1;
            coupon.save(next);
        });
    } else {
        next();
    }
});

module.exports = DiscountCoupon;
