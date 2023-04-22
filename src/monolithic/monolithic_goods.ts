import { ServerResponse } from 'http';
import QUERY from '../query';
import { Params, httpMethod } from '../types';
import { isGoodsGetDto } from '../types/Goods';
import Database from '../utils/DB';

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
    if (!isGoodsGetDto(params)) {
      throw new Error('Invalid Parameters');
    }
    await Database.query(QUERY.postGoods, {
      name: params.name,
      category: params.category,
      price: params.price,
      description: params.description,
    });
  } catch (e: any) {
    response.errorcode = 1;
    response.errormessage = e.message;
  }
  handleResponse(response);
};

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
    const result = await Database.query(QUERY.getGoods, {
      name: params.name,
      category: params.category,
      price: params.price,
      description: params.description,
    });
    if (result.error || result.data?.[0].length === 0) {
      throw Error('No data');
    }
    response.results = result.data?.[0] || [];
  } catch (e: any) {
    response.errorcode = 1;
    response.errormessage = e.message;
  }
  handleResponse(response);
};

const unregister = async (
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
    if (!params.id) {
      throw new Error('Invalid Parameters');
    }
    await Database.query(QUERY.deleteGoods, {
      id: params.id,
    });
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
  handleResponse: Function;
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
    case 'DELETE':
      return unregister(method, pathname, params, (response: any) => {
        process.nextTick(handleResponse, res, response);
      });
    default:
      return process.nextTick(handleResponse, res, null);
  }
};

const goods = { onRequest };
export default goods;
