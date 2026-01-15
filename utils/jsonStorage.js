const fs = require('fs');

function getData(key = null) {
    const raw = fs.readFileSync('./data.json');
    const data = JSON.parse(raw);

    if (key) return data[key];
    return data;
}

function setData(key, value) {
    const data = getData();
    data[key] = value;
    fs.writeFileSync('./data.json', JSON.stringify(data, null, 2));
}

module.exports = { getData, setData };