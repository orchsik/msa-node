import * as net from 'net';
import http from 'http';

export type ServerResponse = http.ServerResponse | net.Socket;
export type HandleServerResponse = (
  serverResponse: ServerResponse,
  packet: any
) => void;

export const handleServerResponse: HandleServerResponse = (
  serverResonse,
  packet
) => {
  if (serverResonse instanceof net.Socket) {
    serverResonse.write(JSON.stringify(packet) + PACKET_SEP);
  } else if (serverResonse instanceof http.ServerResponse) {
    serverResonse.writeHead(200, { 'Content-Type': 'application/json' });
    serverResonse.end(JSON.stringify(packet));
  }
};

export const PACKET_SEP = '¶';

export const lastCharFor = (str: string) => {
  return str.charAt(str.length - 1);
};

export const isLastIdxFor = (list: any[], idx: number) => {
  return idx === list.length - 1;
};

export const nodeKeyFor = (socket: net.Socket) =>
  `${socket.remoteAddress}:${socket.remotePort}`;
