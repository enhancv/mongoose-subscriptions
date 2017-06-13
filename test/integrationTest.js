"use strict";

const assert = require("assert");
const sinon = require("sinon");
const database = require("./database");
const mongoose = require("mongoose");
const main = require("../src");
const User = mongoose.model("User", new mongoose.Schema({ phone: String }));
const VisitorSchema = new mongoose.Schema({ name: String, email: String });
const Visitor = User.discriminator("UserVisitor", VisitorSchema);
const Customer = User.discriminator("UserCustomer", main.Schema.Customer);

describe(
    "Extending User model",
    database([User], function() {
        it("Should be able to change User object to Customer object", function() {
            const user = new Visitor({
                name: "New Test",
                email: "test@example.com",
            });

            return user
                .save()
                .then(user => {
                    assert.ok(user instanceof User, "user should be User");
                    assert.ok(
                        user instanceof Visitor,
                        "user should be Visitor"
                    );
                    assert.ok(
                        !(user instanceof Customer),
                        "user should not be a Customer"
                    );

                    return Customer.hydrate(user.toObject()).increment().save();
                })
                .then(customer => {
                    assert.ok(
                        customer instanceof User,
                        "customer should be User"
                    );
                    assert.ok(
                        !(customer instanceof Visitor),
                        "customer should not be Visitor"
                    );
                    assert.ok(
                        customer instanceof Customer,
                        "customer should be Customer"
                    );
                });
        });
    })
);
