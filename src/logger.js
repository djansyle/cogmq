import debug from 'debug';

export const client = {
  error: debug('cogmq:client:error'),
  info: debug('cogmq:client:info'),
  inbound: debug('cogmq:client:inbound'),
  outbound: debug('cogmq:client:outbound'),
};

export const server = {
  error: debug('cogmq:server:error'),
  info: debug('cogmq:server:info'),
  inbound: debug('cogmq:server:inbound'),
  outbound: debug('cogmq:server:outbound'),
};

export default { server, client };
