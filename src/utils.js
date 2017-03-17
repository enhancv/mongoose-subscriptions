'use strict';

function firstName (fullName) {
    return fullName ? fullName.substr(0, fullName.indexOf(' ')) : '';
}

function lastName (fullName) {
    return fullName ? fullName.substr(fullName.indexOf(' ') + 1).trim() : '';
}

function fullName (firstName, lastName) {
    return (firstName + ' ' + lastName).trim();
}

function capitalize (string) {
    return string ? string.charAt(0).toUpperCase() + string.slice(1) : '';
}

module.exports = {
    firstName: firstName,
    capitalize: capitalize,
    lastName: lastName,
    fullName: fullName,
};
