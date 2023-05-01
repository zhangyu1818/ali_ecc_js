import axios from 'axios';
import * as secp from '@noble/secp256k1';
import { v4 as uuidv4 } from 'uuid';

const config = {
  appId: '5dde4e1bdf9e4966b387ba58f4b3fdc3',
  deviceId: 'uuidv4()或者浏览器里的deviceId',
  userId: 'userId',
  nonce: 0,
};
const token = 'token';

const privateKey = secp.utils.randomPrivateKey();

function createHeaders(signature) {
  return {
    Authorization: `Bearer ${token}`,
    origin: 'https://www.aliyundrive.com',
    referer: 'https://www.aliyundrive.com',
    'x-canary': `client=web,app=adrive,version=v4.3.0`,
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 Edg/112.0.1722.58',
    'x-device-id': config.deviceId,
    'x-signature': signature,
  };
}

async function genSignature() {
  const message = `${config.appId}:${config.deviceId}:${config.userId}:${config.nonce}`;
  const data = await secp.utils.sha256(stringToUint8Array(message));
  const [signature, recovery] = await secp.sign(data, privateKey, {
    recovered: true,
    der: false,
  });
  const recoverySignature = `${secp.utils.bytesToHex(signature)}0${recovery}`;
  return recoverySignature;
}

async function createSession() {
  const signature = await genSignature();
  const data = {
    deviceName: `Edge浏览器`,
    modelName: `Mac OS网页版`,
    pubKey: secp.utils.bytesToHex(secp.getPublicKey(privateKey)),
  };
  const headers = createHeaders(signature);
  const result = await axios.post(
    'https://api.aliyundrive.com/users/v1/users/device/create_session',
    data,
    {
      headers,
    }
  );
  console.log(result);
}

async function renewSession() {
  const signature = await genSignature();
  const headers = createHeaders(signature);
  const result = await axios.post(
    'https://api.aliyundrive.com/users/v1/users/device/renew_session',
    {},
    {
      headers: {
        ...headers,
        'Content-Type': 'application/json;charset=UTF-8',
      },
    }
  );
  console.log(result);
}
function stringToUint8Array(str) {
  const uint8Array = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    uint8Array[i] = str.charCodeAt(i);
  }
  return uint8Array;
}

(async function () {
  for (const i of Array(10).keys()) {
    console.log('nonce', config.nonce);
    if (i === 0) {
      console.log('create session');
      await createSession();
      config.nonce += 1;
    } else {
      await sleep(5000);
      console.log('renew session');
      await renewSession();
      config.nonce += 1;
    }
  }
})();

// sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
