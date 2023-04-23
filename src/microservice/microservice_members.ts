import * as net from 'net';
import TcpServer from '../distributor/TcpServer';
import { DISTRIBUTOR_PORT, HOST, MEMBER_SERVICE_PORT } from '../config';
import members from '../monolithic/monolithic_members';
import { handleServerResponse } from '../utils';

class Members extends TcpServer {
  constructor() {
    super(
      'members',
      process.argv[2] ? Number(process.argv[2]) : MEMBER_SERVICE_PORT,
      ['POST/members', 'GET/members', 'DELETE/members']
    );

    this.connectToDistributor(HOST, DISTRIBUTOR_PORT, (data) => {
      console.log('Distributor Notification', data);
    });
  }

  protected onRead(socket: net.Socket, data: any) {
    console.log('onRead', socket.remoteAddress, socket.remotePort, data);
    members.onRequest({
      res: socket,
      method: data.method,
      pathname: data.uri,
      params: data.params,
      handleResponse: handleServerResponse,
    });
  }
}
new Members();
