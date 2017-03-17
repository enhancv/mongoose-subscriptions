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

function originalValue (schema, options) {
    function saveOriginalNamed (item) {
        this.original = {};

        options.fields.forEach(name => {
            this.original[name] = item.toObject()[name];
        });
    }

    schema.post('init', saveOriginalNamed);
    schema.post('save', saveOriginalNamed);

    schema.methods.added = function (name) {
        return this[name].filter(item => !this.original[name].id(item._id));
    }

    schema.methods.removed = function (name) {
        return this.original[name].filter(item => !this[name].id(item._id));
    }

    schema.methods.updated = function (name) {
        return this[name].filter(item => this.original[name].id(item._id));
    }
}

module.exports = {
    firstName: firstName,
    originalValue: originalValue,
    capitalize: capitalize,
    lastName: lastName,
    fullName: fullName,
};
