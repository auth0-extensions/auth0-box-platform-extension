import nconf from 'nconf';
import config from '../server/lib/config';
import certs from './mocks/certs.json';
import { wellKnownEndpoint } from './mocks/tokens';

nconf
  .argv()
  .env()
  .defaults({
    API_AUDIENCE: 'urn:box-platform-api',
    AUTH0_CLIENT_ID: '111',
    AUTH0_CLIENT_SECRET: '222',
    AUTH0_RTA: 'auth0.auth0.local',
    AUTH0_DOMAIN: 'foo.auth0.local',
    WT_URL: 'http://foo',
    EXTENSION_SECRET: 'abc',
    NODE_ENV: 'test',
    DATA_CACHE_MAX_AGE: 0,
    DUMMY_KEY: 'DUMMY_VALUE',
    PUBLIC_WT_URL: 'http://foo',
    BOX_SETTINGS_FILE: '{"boxAppSettings": {"clientID": "boxClientId", "clientSecret": "boxClientSecret", "appAuth": {"publicKeyID": "12345", "privateKey": "-----BEGIN ENCRYPTED PRIVATE KEY-----\\nMIIFDjBABgkqhkiG9w0BBQ0wMzAbBgkqhkiG9w0BBQwwDgQIz4OeYNPh5Y8CAggA\\nMBQGCCqGSIb3DQMHBAicrxpryxpLwwSCBMjr0Al4PuRSyKcEZltoLDYUoxOADJMc\\nNCzfrOVJWWJG0H9qBeGYiycQDrQNTdW+yKhJzNAJwnmxpvpUpiRPMbC/MCOsG/Yn\\nfLUNFV5sFZuBcmwBlNqr8Yx/0DhN5pLgKc/9TQyXyxL7cZmD1EDiSjWGaifevjDg\\nuHLENgmQ64L6P5fc/ycxNq+ca6gPw1h7Jdr+tvHhnIbVqcJ8KVOZc8wZ4Cbt12RC\\nkzO7CFjfdVLPZp4Au+3wGGSq4jdIjj7JQoDoA1WwwjlQyqAhtOT9/MIdC4hQ/egJ\\nYSYQl+xGrQcawdZ+dnxxvCqrtAPv++FS1DEyCY0mfKw2T1atEwDnlT3G3YE4DRZ/\\n6Xl4GiaFxh3smK35hqUBWlmu8vgk9lNX14gRIF67SyppnjRaELwOqputbmVEmnX2\\nIHwu9PJtJFRylMqA70uVVejgZBsqSF191De9vjMHHv8SECzMjh0OPC2FVux4JjfS\\n7eazWMgmHClmxAut4ou6miCjIVyrUujR4ltdfScQII/gdcvxLUjsTJt/YNHkIiCT\\nRoHcwXUaYVmqPDOG77TLD1ec49VCFdxJxgWYFp7ngYwEqb4IydR4G7qe8uDYBUb+\\nxPgF6MHmolxevxNWC+LO0i2luFi5tSEokIMZC/mH5HbwLLixWzcaK/nTKmJRCex1\\n75TjZr8+4CzgaJ1poKGBlfTfDP7plt4/yyzwr6jwkzpZTWx2CNvxwu8NxEBs8Yn4\\nOR7O2w6evI2cXPSedaL8MKW2u6YZ5i5dnPN4SsT2Kpi8KyjmJpdKsRQUAVVjQ6sZ\\n9PFXNm9h+PEnRCAzm5bgp36ArO7R2evORXyBzzapTqEIGzsGKdtiyhRgCC/1XRtM\\n1mQhBP4HMYOjHdcdsvfVotjmNZ3iYypouGBUYcDwQT8yAnpdkw64r1Lu6TV93SHo\\n4AOTCiBcy53yGUDD14inF3wFZpnN32S2Ka/be63MMWTKAo3e0lPpOJHl05U1hBT7\\nkc7FG6Ng1QcR0+PFjLyGk8PHNqdBUOZsIRPgTEmeUGiAa6KGYuLEkbbWw/gn6jnB\\nVUNss9Iq3z6414e2AQob+KlYlGuYuMYJA5P+nXYfNIeXb+wjGAW/HmFTbwtRPH7C\\nYcau/b7A6SPPRz3QLWt7/EZ36fB3lw17E/rhPJLxDi1mpHxfo4Pp+0m4U6y5paCB\\nN4x160bdMmj3DykR+kbVEARx3dCN7qkrj3er1JBT7vraR0N7jd5yeqAL/tYi4hm2\\nFgEjmiw3t+DKQ9vCGWKF78gAXar51IrjbSJFIack78Lda7fvvClbDgZn6UKt2gtW\\nh+Dsvi7L2EZ7CPWJiCs6elqI/DZ5f2p/cinaSwNasT1qUkKbPKo0EpgK8HkAM3r2\\nwu/1kENEHKy7imr/ORQX4591dtSrxZrb1YiV4vpweKaWfPvC813NyGvnKuKk6o9B\\noy9oRSXhCoQt/+FD/6kLmHX+SCUgVy2tNuAwQZCwqU0aZs3qAPfaGqqRsyWGQfhJ\\nFSvPzjL1ZA9KjD1EU+r37wdui2AWMKhwlrlje9SYwZaVqppmboDObE9mhsvPNPL6\\nUIWIXrAzgwNtsWiw1w7TQe3xqzDNj+EvgycXqk3X/XBoVxarnmGHAY1mAa68WpHZ\\ny0I=\\n-----END ENCRYPTED PRIVATE KEY-----\\n", "passphrase": "3bccff81b298352fbb5cd7101cd8e871"}}, "enterpriseID": "boxEnterpriseID"}'
  });

config.setProvider(key => nconf.get(key));
wellKnownEndpoint(config('AUTH0_DOMAIN'), certs.bar.cert, 'key2');
