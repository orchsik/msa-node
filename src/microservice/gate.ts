import http from 'http';
import url from 'url';

import { DistributorPacket, httpMethod } from '../types';
import { HOST, HTTP_SERVER_PORT } from '../config';
import TcpClient, { OnCreate, OnEnd, OnRead } from '../distributor/TcpClient';
import { DISTRIBUTOR_PORT } from '../config';

const mapClients: {
  [key: string]: { client: TcpClient; info: any };
} = {};
const mapUrls: { [key: string]: TcpClient[] } = {};
const mapResponse: { [key: string]: http.ServerResponse } = {};
const mapRR: { [key: string]: any } = {};
let index = 0;

// HTTP 서버 생성
const gateServer = http
  .createServer((req, res) => {
    const method = req.method as httpMethod;
    const uri = url.parse(req.url || '', true);
    const pathname = uri.pathname || '';

    if (method === 'POST' || method === 'PUT') {
      let body = '';
      req.on('data', (data) => {
        body += data;
      });
      req.on('end', () => {
        let params;
        if (req.headers['content-type'] === 'application/json') {
          params = JSON.parse(body);
        } else {
          params = body;
        }
        onRequest(res, method, pathname, params);
      });
    } else {
      onRequest(res, method, pathname, uri.query);
    }
  })
  .listen(HTTP_SERVER_PORT, () => {
    console.log(`Gateway Server LISTEN`, HTTP_SERVER_PORT);

    const packet: DistributorPacket = {
      uri: '/distributes',
      method: 'POST',
      key: 0,
      params: {
        port: HTTP_SERVER_PORT,
        name: 'gate',
        urls: [],
      },
    };
    let isConnectedDistributor = false;

    const clientDistributor = new TcpClient({
      host: HOST,
      port: DISTRIBUTOR_PORT,
      onCreate: (options) => {
        isConnectedDistributor = true;
        clientDistributor.write(packet);
      },
      onRead: (options, data) => {
        onDistribute(data);
      },
      onEnd: (options) => {
        isConnectedDistributor = false;
      },
      onError: (options) => {
        isConnectedDistributor = false;
      },
    });

    setInterval(() => {
      if (isConnectedDistributor) return;
      clientDistributor.connect();
    }, 3_000);
  }); // end listen callback

// API 호출에 대한 응답 처리
const onRequest = (
  res: http.ServerResponse,
  method: httpMethod,
  pathname: string,
  params: any
) => {
  const key = method + pathname;
  const clients = mapUrls[key];
  if (!clients) {
    res.writeHead(404);
    res.end();
    return;
  } else {
    const _packet: DistributorPacket = {
      key: index, // // 요청에 대한 고유한 키값을 부여
      uri: pathname,
      method,
      params,
    };
    mapResponse[index] = res;
    index++;

    // Round Robin을 위한 초기화
    if (!mapRR[key]) {
      mapRR[key] = 0;
    }
    mapRR[key]++;
    clients[mapRR[key] % clients.length].write(_packet);
  }
};

// 마이크로서비스 접속 이벤트 처리
const onCreateClient: OnCreate = () => {
  console.log('onCreateClient');
};

// 마이크로서비스 응답 처리
const onReadClient: OnRead = (options, packet) => {
  console.log('onReadClient', packet);
  mapResponse[packet.key].writeHead(200, {
    'Content-Type': 'application/json',
  });
  mapResponse[packet.key].end(JSON.stringify(packet));
  delete mapResponse[packet.key];
};

// 마이크로서비스 접속 종료 처리
const onEndClient: OnEnd = (options) => {
  const nodeKey = options.host + ':' + options.port;
  console.log('onEndClient', mapClients[nodeKey]);
  for (const idx in mapClients[nodeKey].info.urls) {
    const node = mapClients[nodeKey].info.urls[idx];
    delete mapUrls[node];
  }
  delete mapClients[nodeKey];
};

// 마이크로서비스 접속 에러 처리
const onErrorClient = (options: any) => {
  console.log('onErrorClient', options);
};

// Distributor로부터 서비스 노드 정보를 받아옴
const onDistribute = (data: any) => {
  for (const n in data.params) {
    const node = data.params[n];
    const clientKey = node.host + ':' + node.port;
    if (!mapClients[clientKey] && node.name !== 'gate') {
      const client = new TcpClient({
        host: node.host,
        port: node.port,
        onCreate: onCreateClient,
        onRead: onReadClient,
        onEnd: onEndClient,
        onError: onErrorClient,
      });

      mapClients[clientKey] = { client, info: node };
      for (const url in node.urls) {
        const key = node.urls[url];
        if (!mapUrls[key]) {
          mapUrls[key] = [];
        }
        mapUrls[key].push(client);
      }
      client.connect();
    }
  }
};
