export type IGoods = {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
};

export type GoodsGetDto = Pick<
  IGoods,
  'name' | 'category' | 'price' | 'description'
>;

export const isGoodsGetDto = (data: any): data is GoodsGetDto => {
  return (
    typeof data.name === 'string' &&
    typeof data.category === 'string' &&
    typeof data.price === 'number' &&
    typeof data.description === 'string'
  );
};
