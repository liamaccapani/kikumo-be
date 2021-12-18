import jwt from "jsonwebtoken";

export const JWTGenerateToken = (payload) =>
  new Promise((resolve, reject) =>
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "3h" },
      (error, token) => {
        if (error) reject(error);
        else resolve(token);
      }
    )
  );

export const verifyToken = (token) =>
  new Promise((resolve, reject) =>
    jwt.verify(token, process.env.JWT_SECRET, (error, decodedToken) => {
      if (error) reject(error);
      else resolve(decodedToken);
    })
  );

export const generateToken = async (user) => {
  const accessToken = await JWTGenerateToken({ _id: user._id, role: user.role });

  return accessToken;
};