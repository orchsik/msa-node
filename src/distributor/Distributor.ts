import * as net from 'net';
import TcpServer from './TcpServer';
import { ServiceNode, ServiceNodePacket } from '../types';
import { PACKET_SEP, nodeKeyFor } from '../utils';
import { DISTRIBUTOR_PORT } from '../config';

// 접속 노드 관리 오브젝트
const nodeMap: {
  [key: string]: ServiceNode;
} = {};

/**
 * 노드가 접속하면 접속한 노드에 현재 접속 중인 다른 노드의
 * 정보를 제공하고, 노드 접속이 종료되면 다른 접속된 노드에 전파
 * 하는 기능.
 */
export default class Distributor extends TcpServer {
  constructor() {
    super('distributor', DISTRIBUTOR_PORT, [
      'POST/distributes',
      'GET/distributes',
    ]);
  }

  // 노드 점속 이벤트
  protected onCreate(socket: net.Socket) {
    console.log('onCreate', socket.remoteAddress, socket.remotePort);
    this.sendInfo(socket);
  }

  // 노드 접속 해제 이벤트 처리
  protected onClose(socket: net.Socket): void {
    const key = nodeKeyFor(socket);
    console.log('onClose', socket.remoteAddress, socket.remotePort);
    delete nodeMap[key];
    this.sendInfo();
  }

  // 노드 등록 처리
  protected onRead(socket: net.Socket, json: any) {
    const key = nodeKeyFor(socket);
    console.log('onRead', socket.remoteAddress, socket.remotePort, json);

    // 접속 노드 정보 등록
    if (json.uri === '/distributes' && json.method === 'POST') {
      nodeMap[key] = { socket };
      nodeMap[key].info = json.params;
      nodeMap[key].info.host = socket.remoteAddress;
      // 접속 노드 정보 전파
      this.sendInfo();
    }
  }

  private write(socket: net.Socket, packet: ServiceNodePacket) {
    socket.write(JSON.stringify(packet) + PACKET_SEP);
  }

  // 접속 노드 혹은 특정 소켓에 접속 노드 정보 전파
  private sendInfo(socket?: net.Socket) {
    const packet: ServiceNodePacket = {
      uri: '/distributes',
      method: 'POST',
      key: 0,
      params: [],
    };

    for (const key in nodeMap) {
      packet.params?.push(nodeMap[key].info);
    }

    if (socket) {
      this.write(socket, packet);
    } else {
      for (const key in nodeMap) {
        this.write(nodeMap[key].socket, packet);
      }
    }
  }
}
new Distributor();
