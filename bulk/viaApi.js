/**
 * How to run it???
 * 
 * node viaApi.js -c '{"baseUrl":"http://localhost:8080/elements/api-v2","authorization":"User XXXXXX, Organization XXXXXX, Element XXXXXXXX=","objectName":"sfdcAccounts"}'

 */
const sleep = require('sleep');
const rp = require('request-promise');
var fs = require('fs')
const args = require('minimist')(process.argv.slice(2));
if (!(args && args.c)) {
    console.warn("Yoo boy.... put some data in there with command line arg '-c'!  Like authorization, objectName, and baseUrl as a JSONObject");
    process.exit(-1);
}

var creds = JSON.parse(args.c);
if (!creds.hasOwnProperty("baseUrl") || !creds.hasOwnProperty('authorization') || !creds.hasOwnProperty('objectName')) {
    console.warn('Missing one of Authorization, baseUrl, objectName');
    process.exit(-1);
}


var objectName = creds.objectName;
var authorization = creds.authorization;
var url = creds.baseUrl;

var writer = fs.createWriteStream(`./data/${objectName}.txt`, {
    flags: 'w' // 'a' means appending (old data will be preserved)
})

var nextPage = null;

const safeSleep = secs => {
    sleep.sleep(secs);
  }
//where: "incremental='true' and start_time='1389743940'",
const buildOptions = nextPage => {
    return {
        uri: `${url}/${objectName}`,
        qs: {
            where: "incremental='true' and start_time='1276280816'",
            nextPage,
            pageSize: 1000
        },
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': authorization
        },
        json: true,
        resolveWithFullResponse: true,
    };
}
var start = null;
/**
 * Runs untill last page and writes each page into the specified file...
 */
const run = async () => {
    safeSleep(10);
    await rp(buildOptions(nextPage))
        .then((r) => {
            if (r.headers && r.headers['elements-next-page-token']) {
                nextPage = r.headers['elements-next-page-token'];
            }
            let recordSize = r.body.length;
            console.log(nextPage, Buffer.from(nextPage, 'base64').toString('binary'), recordSize);
            r.body.forEach(obj => writer.write(JSON.stringify(obj) + '\n'));

            if (recordSize > 0) {
                run();
            } else {
                console.log('Time taken to finish bulk via API calls: ', (new Date().getTime() - start));
            }
        })
        .catch(function (err) {
            console.log(err);
        });
}
start = new Date().getTime();
run();

