import * as net from 'net';
import { DISTRIBUTOR_PORT, GOODS_SERVICE_PORT, HOST } from '../config';
import TcpServer from '../distributor/TcpServer';
import goods from '../monolithic/monolithic_goods';
import { handleServerResponse } from '../utils';

class Goods extends TcpServer {
  constructor() {
    super(
      'goods',
      process.argv[2] ? Number(process.argv[2]) : GOODS_SERVICE_PORT,
      ['POST/goods', 'GET/goods', 'DELETE/goods']
    );

    this.connectToDistributor(HOST, DISTRIBUTOR_PORT, (data) => {
      console.log('Distributor Notification', data);
    });
  }

  protected onRead(socket: net.Socket, data: any) {
    console.log('onRead', socket.remoteAddress, socket.remotePort, data);
    goods.onRequest({
      res: socket,
      method: data.method,
      pathname: data.uri,
      params: data.params,
      handleResponse: handleServerResponse,
    });
  }
}
new Goods();
