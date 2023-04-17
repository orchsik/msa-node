import * as net from 'net';

export const PACKET_SEP = '¶';

export const lastCharFor = (str: string) => {
  return str.charAt(str.length - 1);
};

export const isLastIdxFor = (list: any[], idx: number) => {
  return idx === list.length - 1;
};

export const nodeKeyFor = (socket: net.Socket) =>
  `${socket.remoteAddress}:${socket.remotePort}`;
