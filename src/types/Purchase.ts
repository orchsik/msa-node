export type IPurchase = {
  id: number;
  userid: number;
  goodsid: number;
  date: string;
};

export type PurchaseGetDto = Pick<IPurchase, 'userid' | 'goodsid'>;

export const isPurchaseGetDto = (data: any): data is PurchaseGetDto => {
  return typeof data.userid === 'number' && typeof data.goodsid === 'number';
};
