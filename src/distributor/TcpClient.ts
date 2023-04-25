import * as net from 'net';
import { DistributorPacket } from '../types';
import { isLastIdxFor, lastCharFor, PACKET_SEP } from '../utils';

type TcpClientOptions = net.NetConnectOpts & {
  host: string;
  port: number;
};
export type OnCreate = (options: TcpClientOptions) => void;
export type OnRead = (options: TcpClientOptions, data: any) => void;
export type OnEnd = (options: TcpClientOptions) => void;
export type OnError = (options: TcpClientOptions, error: any) => void;

/**
 * "접속", "데이터 수신", "데이터 발송" 세 가지 기능으로 구성한다.
 */
export default class TcpClient {
  private options: TcpClientOptions;
  private onCreate: OnCreate;
  private onRead: OnRead;
  private onEnd: OnEnd;
  private onError: OnError;
  private client: net.Socket | undefined;
  private merge: string | undefined;

  constructor({
    host,
    port,
    onCreate,
    onRead,
    onEnd,
    onError,
  }: {
    host: string;
    port: number;
    onCreate: OnCreate;
    onRead: OnRead;
    onEnd: OnEnd;
    onError: OnError;
  }) {
    this.options = {
      host,
      port,
    };
    this.onCreate = onCreate;
    this.onRead = onRead;
    this.onEnd = onEnd;
    this.onError = onError;
  }

  /**
   * 접속 함수
   */
  public connect() {
    this.client = net.connect(this.options, () => {
      this.onCreate(this.options);
    });

    // 데이터 수신 처리
    this.client.on('data', (data) => {
      const sz = this.merge ? this.merge + data.toString() : data.toString();
      const packets = sz.split(PACKET_SEP);
      for (const idx in packets) {
        if (lastCharFor(sz) !== PACKET_SEP && isLastIdxFor(packets, +idx)) {
          this.merge = packets[idx];
          break;
        } else if (packets[idx] === '') {
          break;
        } else {
          this.onRead(this.options, JSON.parse(packets[idx]));
        }
      }
    });

    // 접속 종료 처리
    this.client.on('close', () => {
      this.onEnd(this.options);
    });

    // 에러 처리
    this.client.on('error', (error) => {
      this.onError(this.options, error);
    });
  }

  /**
   * 데이터 발송
   */
  public write(packet: DistributorPacket) {
    this.client?.write(JSON.stringify(packet) + PACKET_SEP);
  }
}
