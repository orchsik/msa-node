import * as net from 'net';
import { DistributorPacket } from '../types';
import { isLastIdx, lastCharFor } from '../utils';

export default class TcpClient {
  private options: net.NetConnectOpts;
  private client: net.Socket | undefined;
  private merge: string | undefined;

  constructor(
    host: string,
    port: number,
    private onCreate: (options: net.NetConnectOpts) => void,
    private onRead: (options: net.NetConnectOpts, data: any) => void,
    private onEnd: (options: net.NetConnectOpts) => void,
    private onError: (options: net.NetConnectOpts, error: any) => void
  ) {
    this.options = { host, port };
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
      const arr = sz.split('¶');
      for (const idx in arr) {
        if (lastCharFor(sz) !== '¶' && isLastIdx(+idx, arr.length - 1)) {
          this.merge = idx;
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
    this.client?.write(JSON.stringify(packet) + '¶');
  }
}
