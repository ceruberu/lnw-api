import { ObjectId } from "mongodb";
import { AuthenticationError } from "apollo-server-express";
import jwt from "jsonwebtoken";

const isProduction = process.env.NODE_ENV === "production";
const ADDRESS = isProduction ? "https://ceruberu.com/" : `http://localhost:${3000}/`;
const TOKEN_SECRET = process.env.TOKEN_SECRET;

export function generateToken({ user }, res) {
  const expiresIn = "7d";
  const roles = ["user"];

  const token = jwt.sign(
    {
      _id: user._id.toString(),
      roles
    },
    TOKEN_SECRET,
    {
      expiresIn
    }
  );

  // TO-DO add secure:true based on build stage
  res.cookie("token", token, { httpOnly: true });
  res.redirect(ADDRESS);
}

export async function validateToken(User, clientToken, res) {
  let tokenUser;
  try {
    tokenUser = await jwt.verify(clientToken, TOKEN_SECRET);
  } catch (err) {
    res.clearCookie("token");
    throw new AuthenticationError("Token is no longer valid");
  }

  let user;
  try {
    user = await User.findOne({ _id: ObjectId(tokenUser._id) });
  } catch (err) {
    res.clearCookie("token");
    throw new AuthenticationError("Could not load User from database");
  }

  user._id = user._id.toString();

  return user;
}
