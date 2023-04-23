import * as net from 'net';
import { DISTRIBUTOR_PORT, HOST, PURCHASE_SERVICE_PORT } from '../config';
import TcpServer from '../distributor/TcpServer';
import purchases from '../monolithic/monolithic_purchases';
import { handleServerResponse } from '../utils';

class Purchases extends TcpServer {
  constructor() {
    super(
      'purchases',
      process.argv[2] ? Number(process.argv[2]) : PURCHASE_SERVICE_PORT,
      ['POST/purchases', 'GET/purchases']
    );

    this.connectToDistributor(HOST, DISTRIBUTOR_PORT, (data) => {
      console.log('Distributor Notification', data);
    });
  }

  protected onRead(socket: net.Socket, data: any) {
    console.log('onRead', socket.remoteAddress, socket.remotePort, data);
    purchases.onRequest({
      res: socket,
      method: data.method,
      pathname: data.uri,
      params: data.params,
      handleResponse: handleServerResponse,
    });
  }
}
new Purchases();
