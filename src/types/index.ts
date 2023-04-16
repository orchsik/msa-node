import * as net from 'net';

export type ServiceNode = {
  socket: net.Socket;
  info?: any;
};

export type ServiceNodePacket = {
  uri: string;
  method: string;
  key: number;
  params: ServiceNode[];
};

export type DistributorContext = {
  name: string;
  port: number;
  urls: string[];
};

export type DistributorPacket = {
  uri: string;
  method: string;
  key: number;
  params: DistributorContext | ServiceNode[] | undefined;
};
