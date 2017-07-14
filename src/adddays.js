function adddays(date, days) {
    const result = new Date(date);
    result.setUTCDate(date.getUTCDate() + days);
    return result;
}

module.exports = adddays;
