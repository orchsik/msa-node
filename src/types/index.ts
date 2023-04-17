import * as net from 'net';

export type ServiceNode = {
  socket: net.Socket;
  info?: any;
};

export type ServiceNodePacket = {
  key: number;
  uri: string;
  method: string;
  params: ServiceNode[];
};

export type DistributorContext = {
  name: string;
  port: number;
  urls: string[];
};

export type DistributorPacket = {
  key: number;
  uri: string;
  method: string;
  params: DistributorContext;
};
