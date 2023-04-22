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

const QUERY = {
  postUser,
  getUser,
  deleteUser,
};

export default QUERY;
