import QUERY from '../query';
import { Params, httpMethod } from '../types';
import { isPurchaseGetDto } from '../types/Purchase';
import { HandleServerResponse, ServerResponse } from '../utils';
import Database from '../utils/DB';

/**
 * POST /purchases
 */
const register = async (
  method: httpMethod,
  pathname: string,
  params: Params,
  handleResponse: Function
) => {
  const response = {
    key: params.key,
    errorcode: 0,
    errormessage: 'success',
  };

  try {
    if (!isPurchaseGetDto(params)) {
      throw new Error('Invalid Parameters');
    }
    await Database.query(QUERY.insertPurchase, {
      userid: params.userid,
      goodsid: params.goodsid,
    });
  } catch (e: any) {
    response.errorcode = 1;
    response.errormessage = e.message;
  }
  handleResponse(response);
};

/**
 * GET /purchases?userid=1
 */
const inquiry = async (
  method: httpMethod,
  pathname: string,
  params: Params,
  handleResponse: Function
) => {
  const response = {
    key: params.key,
    errorcode: 0,
    errormessage: 'success',
    results: [] as any[],
  };

  try {
    if (!params.userid) {
      throw new Error('Invalid Parameters');
    }

    const result = await Database.query(QUERY.getPurchase, {
      userid: params.userid,
      goodsid: params.goodsid,
    });
    response.results = result[0];
  } catch (e: any) {
    response.errorcode = 1;
    response.errormessage = e.message;
  }
  handleResponse(response);
};

const onRequest = ({
  res,
  method,
  pathname,
  params,
  handleResponse,
}: {
  res: ServerResponse;
  method: httpMethod;
  pathname: string;
  params: Params;
  handleResponse: HandleServerResponse;
}) => {
  switch (method) {
    case 'POST':
      return register(method, pathname, params, (response: any) => {
        process.nextTick(handleResponse, res, response);
      });
    case 'GET':
      return inquiry(method, pathname, params, (response: any) => {
        process.nextTick(handleResponse, res, response);
      });
    default:
      return process.nextTick(handleResponse, res, null);
  }
};

const purchases = { onRequest };
export default purchases;
