'use strict';

function first (full) {
    if (full) {
        var separator = full.indexOf(' ');
        if (separator !== -1) {
            return full.substr(0, separator);
        } else {
            return full;
        }
    }

    return '';
}

function last (full) {
    if (full) {
        var separator = full.indexOf(' ');
        if (separator !== -1) {
            return full.substr(separator + 1).trim();
        }
    }

    return '';
}

function full (first, last) {
    return ((first ? first : '') + ' ' + (last ? last : '')).trim();
}

module.exports = {
    first: first,
    last: last,
    full: full,
};
