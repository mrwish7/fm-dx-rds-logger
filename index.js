const fs = require('fs');
const rdsLog = fs.createWriteStream('./rdslog.log');
const consoler = new console.Console(rdsLog);

const axios = require('axios');

let pi = '?';
let ps = '';
let freq = '87.500';

function getPrettyTimestamp() {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}${minutes}${seconds}z`;
}

const fetchData = async () => {
    axios.get('http://127.0.0.1:27041/api')
        .then (function (response) {
            // Request was successful
            const res_pi = response.data['pi'];
            const res_ps = response.data['ps'];
            const res_freq = response.data['freq'];

            // Firstly, ignore anything with no RDS decoded.
            if (! (res_pi == '?' && res_ps == '')) {
                // Next, only log if at least one of Freq, PI or PS have changed from last time.
                if (! (freq == res_freq && pi == res_pi && ps == res_ps)) {
                    pi = res_pi;
                    ps = res_ps;
                    freq = res_freq;
                    consoler.log(getPrettyTimestamp() + ' | ' + parseFloat(res_freq).toFixed(2).padStart(6) + ' | ' + res_pi.padStart(7) + ' | "' + res_ps + '"');
                }
            }
        })
        .catch(function (error) {
            if (error.response) {
                // Case 1
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
            }
        })
}

setInterval(fetchData, 5000);
