import test from 'ava';
import times from 'lodash.times';
import Promise from 'bluebird';
import rmq from '../src';

async function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

test('Should run, respond, and close', async (t) => {
  const option = { queue: 'test' };
  const message = 'Hello MQ';

  const echoServer = new rmq.Server(option);
  await echoServer.addWorker(m => m);

  const echoClient = new rmq.Client(option);
  const result = await echoClient.send(message);
  t.is(result, message, `Expecting response to equal to ${message}.`);

  await echoClient.stop();
  await echoServer.stop();
});

test('Should give an error', async (t) => {
  const option = { queue: 'error' };
  const message = 'Hello MQ';

  const echoServer = new rmq.Server(option);
  await echoServer.addWorker(() => {
    throw Object.assign({ code: 1, message: 'Failing' });
  });

  const echoClient = new rmq.Client(option);
  const error = await t.throws(echoClient.send(message));
  t.is(error.message, 'Failing', 'Expecting to throw an error.');
});

test('Messages should not overlap to others', async (t) => {
  const echoServers = [new rmq.Server({ queue: '1' }), new rmq.Server({ queue: '2' })];
  const [[, rep1], [, rep2]] = echoServers.map((server) => {
    const { queue } = server;
    const client = new rmq.Client({ queue });
    return [
      server.addWorker(msg => `${queue}-${msg}`),
      client.send('hello'),
    ];
  });

  t.is(await rep1, '1-hello');
  t.is(await rep2, '2-hello');
});

test('Messages should be distributed to multiple workers', async (t) => {
  t.plan(3);
  const echoServer = new rmq.Server({ queue: 'echo' });
  const workers = await [
    echoServer.addWorker(msg => `1-${msg}`),
    echoServer.addWorker(msg => `2-${msg}`),
    echoServer.addWorker(msg => `3-${msg}`),
  ];

  const client = new rmq.Client({ queue: 'echo' });
  const res = await Promise.all(workers.map(() => client.send('hello')));

  res.forEach((itm) => {
    t.true(['1-hello', '2-hello', '3-hello'].includes(itm));
  });
});

test('Should timeout', async (t) => {
  const server = new rmq.Server({ queue: 'throw' });
  await server.addWorker(async () => {
    await delay(500);
  });

  const client = new rmq.Client({ queue: 'throw', timeout: 200 });

  const error = await t.throws(client.send(''), Error);
  t.is(error.message, 'Waiting time reach to the maximum threshold.');
});

test.skip('Stress', async (t) => {
  const option = { queue: 'stress' };

  const echoServer = new rmq.Server(option);
  await echoServer.addWorker(m => m);

  const numRequest = 1000;
  const numClients = 100;
  const clients = times(numClients).map(() => new rmq.Client(option));
  let received = 0;

  await Promise.all(times(numRequest).map(async (i) => {
    await clients[i % numClients].send(i);
    received += 1;
  }));


  t.is(received, numRequest);
});

test('Should use the error', async (t) => {
  const option = { queue: 'custom_error' };
  const message = 'Hello MQ';

  const echoServer = new rmq.Server(option);
  await echoServer.addWorker(() => {
    throw Object.assign({ code: 'FAIL_ERROR', args: { arg1: 'somearg', arg2: 'somearg2' } });
  });

  class CustomHandler {
    constructor({ arg1, arg2 }) {
      this.arg1 = arg1;
      this.arg2 = arg2;
    }
    static getCode() {
      return 'FAIL_ERROR';
    }
  }

  const echoClient = new rmq.Client(option);
  echoClient.addHandler(CustomHandler);

  const error = await t.throws(echoClient.send(message));
  t.truthy(error instanceof CustomHandler);
  t.is(error.arg1, 'somearg');
  t.is(error.arg2, 'somearg2');
});
