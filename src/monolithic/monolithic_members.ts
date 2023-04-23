import * as net from 'net';
import { Params, httpMethod } from '../types';
import Database from '../utils/DB';
import QUERY from '../query';
import { isUserGetDto } from '../types/User';
import { HandleServerResponse, ServerResponse } from '../utils';

/**
 * POST /members
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
    if (!isUserGetDto(params)) {
      throw new Error('Invalid Parameters');
    }
    await Database.query(QUERY.postUser, {
      username: params.username,
      password: params.password,
    });
  } catch (error: any) {
    response.errorcode = 1;
    response.errormessage = error.message;
  }
  handleResponse(response);
};

/**
 * GET /members?username=test_account&password=1234
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
    userid: undefined,
  };

  try {
    if (!isUserGetDto(params)) {
      throw new Error('Invalid Parameters');
    }

    const result = await Database.query(QUERY.getUser, {
      username: params.username,
      password: params.password,
    });

    if (result[0].length === 0) {
      throw new Error('Invalid password');
    }
    response.userid = result[0][0].id;
  } catch (error: any) {
    response.errorcode = 1;
    response.errormessage = error.message;
  }
  handleResponse(response);
};

/**
 * DELETE /members?username=test_account
 */
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
    if (!params.username) {
      throw new Error('Invalid Parameters');
    }
    await Database.query(QUERY.deleteUser, { username: params.username });
  } catch (error: any) {
    response.errorcode = 1;
    response.errormessage = error.message;
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
  res: ServerResponse | net.Socket;
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
    case 'DELETE':
      return unregister(method, pathname, params, (response: any) => {
        process.nextTick(handleResponse, res, response);
      });
    default:
      return process.nextTick(handleResponse, res, null);
  }
};

const members = { onRequest };
export default members;
