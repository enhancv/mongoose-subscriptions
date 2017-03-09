'use strict';

const head = require('lodash/fp/head');
const words = require('lodash/fp/words');
const capitalize = require('lodash/fp/capitalize');
const join = require('lodash/fp/join');
const tail = require('lodash/fp/tail');
const trim = require('lodash/fp/trim');

function firstName (fullName) {
    return capitalize(head(words(fullName)));
}

function lastName (fullName) {
    return join(' ', tail(words(fullName)));
}

function fullName (firstName, lastName) {
    return trim(firstName + ' ' + lastName);
}

module.exports = {
    firstName: firstName,
    lastName: lastName,
    fullName: fullName,
};
