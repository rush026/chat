// db/godb-client.js
const axios = require('axios');
const GODB_URL = process.env.GODB_URL || 'http://localhost:8080';

const godb = {
    set: (key, value) => axios.put(`${GODB_URL}/kv/${key}`, { value: JSON.stringify(value) }),
    get: async(key) => {
        const res = await axios.get(`${GODB_URL}/kv/${key}`);
        return JSON.parse(res.data.value);
    },
    del: (key) => axios.delete(`${GODB_URL}/kv/${key}`),
    scan: async(prefix) => {
        const res = await axios.get(`${GODB_URL}/kv/prefix/${prefix}`);
        return res.data.map(item => JSON.parse(item.value));
    }
};

module.exports = godb;