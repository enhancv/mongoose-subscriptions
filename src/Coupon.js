const mongoose = require("mongoose");
const CouponSchema = require("./Schema/Coupon");

const Coupon = mongoose.model("Coupon", CouponSchema);
const CouponAmount = Coupon.discriminator("CouponAmount", CouponSchema.CouponAmount);
const CouponPercent = Coupon.discriminator("CouponPercent", CouponSchema.CouponPercent);

Coupon.CouponAmount = CouponAmount;
Coupon.CouponPercent = CouponPercent;

module.exports = Coupon;
