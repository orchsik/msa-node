const postUser = `
  INSERT INTO members (username, password)
  VALUES (@username, @password)
  `;

const getUser = `
  SELECT * FROM members
  WHERE username = @username AND password = @password
  `;

const deleteUser = `
  DELETE FROM members
  WHERE username = @username
  `;

const postGoods = `
  INSERT into goods
  (name, category, price, description)
  VALUES
  (@name, @category, @price, @description)
`;

const getGoods = `
  SELECT * FROM goods
  `;

const deleteGoods = `
  DELETE FROM goods WHERE id = @id
`;

const insertPurchase = `
  INSERT INTO purchases
  (userid, goodsid)
  VALUES
  (@userid, @goodsid)
`;

const getPurchase = `
  SELECT id, goodsid, date
  FROM purchases
  WHERE userid = @userid
`;

const QUERY = {
  postUser,
  getUser,
  deleteUser,
  //
  postGoods,
  getGoods,
  deleteGoods,
  //
  insertPurchase,
  getPurchase,
};

export default QUERY;
