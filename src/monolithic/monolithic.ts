import http from 'http';
import url from 'url';
import querystring from 'querystring';

import { Params, httpMethod } from '../types';
import { HTTP_SERVER_PORT } from '../config';
import members from './monolithic_members';
import goods from './monolithic_goods';
import purchases from './monolithic_purchases';
import { handleServerResponse } from '../utils';

const server = http
  .createServer((req, res) => {
    const method = req.method as httpMethod;
    const uri = url.parse(req.url || '', true);
    const pathname = uri.pathname;

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
          params = querystring.parse(body);
        }
        onRequest(res, method, pathname, params);
      });
    } else {
      onRequest(res, method, pathname, uri.query);
    }
  })
  .listen(HTTP_SERVER_PORT, () => {
    console.log(`Monolithic Server is running on port ${HTTP_SERVER_PORT}`);
  });

/**
 * 요청에 대해 회원관리 상품관리 구매관리 모듈별로 분기
 * @param res - HTTP 응답 객체
 * @param method - HTTP 메서드
 * @param pathname - 요청 경로(URI)
 * @param params - 요청 파라미터
 * @returns
 */
const onRequest = (
  res: http.ServerResponse,
  method: httpMethod,
  pathname: string | null,
  params: Params
) => {
  switch (pathname) {
    case '/members':
      members.onRequest({
        res,
        method,
        pathname,
        params,
        handleResponse: handleServerResponse,
      });
      break;
    case '/goods':
      goods.onRequest({
        res,
        method,
        pathname,
        params,
        handleResponse: handleServerResponse,
      });
      break;
    case '/purchases':
      purchases.onRequest({
        res,
        method,
        pathname,
        params,
        handleResponse: handleServerResponse,
      });
      break;
    default:
      res.writeHead(404);
      return res.end();
  }
};
