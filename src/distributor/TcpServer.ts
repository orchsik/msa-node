import * as net from 'net';
import TcpClient from './TcpClient';
import { DistributorContext, DistributorPacket } from '../types';
import { isLastIdxFor, lastCharFor, PACKET_SEP, nodeKeyFor } from '../utils';

/**
 * "리슨", "데이터 수신", "클라이언트 접속 관리" 외에
 * 앞에서 만든 TcpClient를 이용하여 Distributor에 접속하는 기능을 추가한다.
 */
export default class TcpServer {
  private context: DistributorContext;
  private merge: { [serviceKey: string]: string } = {};
  private server: net.Server | undefined;
  private clientDistributor: TcpClient | undefined;

  constructor(
    private name: string,
    private port: number,
    private urls: string[] // 처리가능한 URI 목록
  ) {
    this.context = { name, port, urls };
    this.merge = {};

    // 서버 객체 생성
    this.server = net.createServer((socket) => {
      // 클라이언트 접속 이벤트
      this.onCreate(socket);

      // 에러 이벤트
      socket.on('error', (exception) => {
        console.log(exception);
      });

      // 클라이언트 접속 종료 이벤트
      socket.on('close', () => {
        this.onClose(socket);
      });

      // 데이터 수신 이벤트
      socket.on('data', (data) => {
        const key = nodeKeyFor(socket);
        const sz = (this.merge[key] || '') + data.toString();
        const packets = sz.split(PACKET_SEP);
        for (const idx in packets) {
          if (lastCharFor(sz) !== PACKET_SEP && isLastIdxFor(packets, +idx)) {
            this.merge[key] = packets[idx];
            break;
          } else if (packets[idx] === '') {
            break;
          } else {
            this.onRead(socket, JSON.parse(packets[idx]));
          }
        }
      });
    });

    // 서버 객체 에러 이벤트
    this.server.on('error', (error) => {
      console.log(error);
    });

    // 서버 리슨 이벤트
    this.server.listen(this.port, () => {
      console.log('TcpServer listen', this.port);
    });
  }

  // Distributor에 접속
  protected connectToDistributor(
    host: string,
    port: number,
    onNoti: (data: any) => void
  ) {
    // Distributor 패킷 처리
    const packet: DistributorPacket = {
      uri: '/distributes',
      method: 'POST',
      key: 0,
      params: this.context,
    };
    let isConnectedDistributor = false;

    this.clientDistributor = new TcpClient({
      host,
      port,
      onCreate: (options) => {
        isConnectedDistributor = true;
        this.clientDistributor?.write(packet);
      },
      onRead: (options, data) => {
        onNoti(data);
      },
      onEnd: (options) => {
        isConnectedDistributor = false;
      },
      onError: (options, error) => {
        isConnectedDistributor = false;
      },
    });

    // 주기적으로 재접속
    setInterval(() => {
      if (isConnectedDistributor !== true) {
        this.clientDistributor?.connect();
      }
    }, 3000);
  }

  protected onCreate(socket: net.Socket) {
    console.log('onCreate', socket.remoteAddress, socket.remotePort);
  }

  protected onClose(socket: net.Socket) {
    console.log('onClose', socket.remoteAddress, socket.remotePort);
  }

  protected onRead(socket: net.Socket, json: any) {
    console.log('onRead', socket.remoteAddress, socket.remotePort, json);
  }
}
