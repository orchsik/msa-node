export type GoodsGetDto = {
  name: string;
  category: string;
  price: number;
  description: string;
};

export const isGoodsGetDto = (data: any): data is GoodsGetDto => {
  return (
    typeof data.name === 'string' &&
    typeof data.category === 'string' &&
    typeof data.price === 'number' &&
    typeof data.description === 'string'
  );
};
