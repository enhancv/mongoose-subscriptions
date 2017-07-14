function startofday(date, days) {
    const result = new Date(date);
    result.setUTCHours(0, 0, 0, 0);
    return result;
}

module.exports = startofday;
