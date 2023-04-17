import * as net from 'net';
import { DistributorPacket } from '../types';
import { isLastIdxFor, lastCharFor, PACKET_SEP } from '../utils';

type OnCreate = (options: net.NetConnectOpts) => void;
type OnRead = (options: net.NetConnectOpts, data: any) => void;
type OnEnd = (options: net.NetConnectOpts) => void;
type OnError = (options: net.NetConnectOpts, error: any) => void;

export default class TcpClient {
  private options: net.NetConnectOpts;
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
    this.options = { host, port };
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
      const arr = sz.split(PACKET_SEP);
      for (const idx in arr) {
        if (lastCharFor(sz) !== PACKET_SEP && isLastIdxFor(arr, +idx)) {
          this.merge = arr[idx];
          break;
        } else if (arr[idx] === '') {
          break;
        } else {
          this.onRead(this.options, JSON.parse(arr[idx]));
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
