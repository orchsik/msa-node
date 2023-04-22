import * as net from 'net';
import http from 'http';

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

export type httpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
export type Params = Record<string, any>;
export type Response = (res: http.ServerResponse, packet: any) => void;
