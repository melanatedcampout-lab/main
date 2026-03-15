require('dotenv').config();

const API_KEY = process.env.REGFOX_API_KEY;
const BASE_URL = 'https://api.webconnex.com/v2/public';

const TEST_EMAIL = 'Jocelynmccants@gmail.com';
const TEST_ORDER_NUMBER = 'MLNTDCMPTSGNTZOA01FS';

if (!API_KEY) {
  console.error('ERROR: REGFOX_API_KEY not found in .env');
  process.exit(1);
}

async function query(label, path) {
  const url = `${BASE_URL}${path}`;
  console.log(`\n${'='.repeat(60)}`);
  console.log(`TEST: ${label}`);
  console.log(`URL:  ${url}`);
  console.log('='.repeat(60));

  try {
    const res = await fetch(url, {
      headers: {
        apiKey: API_KEY,
        'Content-Type': 'application/json',
      },
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    console.log(`STATUS: ${res.status} ${res.statusText}`);
    console.log('RESPONSE HEADERS:');
    for (const [k, v] of res.headers.entries()) {
      console.log(`  ${k}: ${v}`);
    }
    console.log('\nRESPONSE BODY:');
    console.log(JSON.stringify(data, null, 2));

    return { status: res.status, data };
  } catch (err) {
    console.log(`FETCH ERROR: ${err.message}`);
    return null;
  }
}

async function main() {
  console.log(`RegFox API Debug Script`);
  console.log(`API Key: ${API_KEY.slice(0, 8)}...${API_KEY.slice(-4)}`);
  console.log(`Test email: ${TEST_EMAIL}`);
  console.log(`Test order number: ${TEST_ORDER_NUMBER}`);

  // 1. Search registrants by email (correct filter param)
  await query(
    'Search registrants by email (filter: email)',
    `/search/registrants?product=regfox.com&email=${encodeURIComponent(TEST_EMAIL)}&pretty=true`
  );

  // 2. Search registrants by orderEmail (the Make.com filter — likely broken)
  await query(
    'Search registrants by orderEmail (Make.com filter — likely wrong)',
    `/search/registrants?product=regfox.com&orderEmail=${encodeURIComponent(TEST_EMAIL)}&pretty=true`
  );

  // 3. Search transactions by email
  await query(
    'Search transactions by email (filter: email)',
    `/search/transactions?product=regfox.com&email=${encodeURIComponent(TEST_EMAIL)}&pretty=true`
  );

  // 4. Search registrants by order number
  await query(
    'Search registrants by order number',
    `/search/registrants?product=regfox.com&orderNumber=${encodeURIComponent(TEST_ORDER_NUMBER)}&pretty=true`
  );

  // 5. Search transactions by order number
  await query(
    'Search transactions by order number',
    `/search/transactions?product=regfox.com&orderNumber=${encodeURIComponent(TEST_ORDER_NUMBER)}&pretty=true`
  );

  // 6. List registrants unfiltered (sanity check — shows real field names)
  await query(
    'List registrants unfiltered (sanity check — first 2 records)',
    `/search/registrants?product=regfox.com&limit=2&pretty=true`
  );
}

main();
