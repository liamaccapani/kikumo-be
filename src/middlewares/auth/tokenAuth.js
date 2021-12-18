import jwt from "jsonwebtoken";

// generates token: payload + secret string + options (expiresIn)
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

// verify --> returns an errorn if token does not match
// export because needed in middleware also
export const verifyToken = (token) =>
  new Promise((resolve, reject) =>
    jwt.verify(token, process.env.JWT_SECRET, (error, decodedToken) => {
      if (error) reject(error);
      else resolve(decodedToken);
    })
  );

export const generateToken = async (user) => {
  // given the user --> generates token --> pass ID in payload
  const accessToken = await JWTGenerateToken({ _id: user._id, role: user.role });

  return accessToken;
};