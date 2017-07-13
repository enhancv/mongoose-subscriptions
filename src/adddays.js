function adddays(date, days) {
    const result = new Date(date);
    result.setDate(date.getDate() + days);
    return result;
}

module.exports = adddays;
