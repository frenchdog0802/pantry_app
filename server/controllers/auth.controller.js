import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { expressjwt } from "express-jwt";
import config from "./../../config/config.js";
import axios from "axios";
import { successResponse, errorResponse } from "../utils/apiResponse.js";


const JWT_COOKIE_TOKEN_NAME = "t";

const signup = async (req, res) => {
  const userExists = await User.findOne({ email: req.body.email });
  if (userExists)
    return res.json(errorResponse("Email is taken"));
  const user = new User(req.body);
  user.role = "user";

  try {
    await user.save();
    const token = jwt.sign({ user_id: user._id }, config.jwtSecret);
    res.cookie(JWT_COOKIE_TOKEN_NAME, token, { expire: new Date() + 9999 });
    return res.json(successResponse({ token, user: { _id: user._id, name: user.name, email: user.email } }));
  } catch (err) {
    return res.json(errorResponse("Could not sign up"));
  }
};

const signin = async (req, res) => {
  const now = () => new Date().toISOString();
  try {
    console.log(`[${now()}] signin invoked`, {
      body: { email: req.body?.email ? req.body.email : undefined },
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.get?.('User-Agent') || req.headers['user-agent'],
    });

    let user = await User.findOne({ email: req.body.email });
    console.log(`[${now()}] user lookup for email=${req.body.email} -> ${user ? `found id=${user._id}` : 'not found'}`);

    if (!user) return res.json(errorResponse("User not found"));

    console.log('password', req.body.password);
    const authOk = user.authenticate(req.body.password);
    console.log(`[${now()}] password authentication for user=${user._id} -> ${authOk}`);

    if (!authOk) {
      return res.json(errorResponse("Email and password don't match."));
    }

    const token = jwt.sign({ user_id: user._id }, config.jwtSecret);
    console.log(`[${now()}] JWT created for user=${user._id}`);

    res.cookie(JWT_COOKIE_TOKEN_NAME, token, { expire: new Date() + 9999 });

    const payload = { token, user: { _id: user._id, name: user.name, email: user.email } };
    console.log(`[${now()}] signin success for user=${user._id}`);

    return res.json(successResponse(payload));
  } catch (err) {
    console.error(`[${now()}] signin error:`, err);
    return res.json(errorResponse("Could not sign in"));
  }
};
const signout = (req, res) => {
  res.clearCookie(JWT_COOKIE_TOKEN_NAME);
  return res.json(successResponse({ message: "signed out" }));
};

const googleLogin = async (req, res, next) => {
  const now = () => new Date().toISOString();
  const mask = (s) => (s ? `${s.slice(0, 6)}...${s.slice(-6)}` : s);

  console.log(`[${now()}] googleLogin invoked`, {
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip || req.connection?.remoteAddress,
    userAgent: req.get?.('User-Agent') || req.headers['user-agent'],
  });

  // if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
  //   console.log(`[${now()}] Authorization header missing or not Bearer:`, authHeader);
  //   return res.status(401).json({ message: 'Authorization header is missing or improperly formatted (must be Bearer token)' });
  // }
  // const accessToken = authHeader.split(' ')[1];
  // console.log(`[${now()}] Received access token (masked):`, mask(accessToken));

  //retrieve token from req body instead of header
  const accessToken = req.body.token;
  console.log(`[${now()}] Received access token from body (masked):`, mask(accessToken));

  let tokenInfoPayload;
  let userInfoPayload;

  try {
    console.log(`[${now()}] Step 1: Calling Google tokeninfo for validation...`);
    const tokenInfoResponse = await axios.get(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`
    );
    console.log(`[${now()}] tokeninfo response status:`, tokenInfoResponse.status);
    // Log only relevant token fields to avoid dumping entire token
    tokenInfoPayload = tokenInfoResponse.data;
    console.log(`[${now()}] tokeninfo payload (selected):`, {
      sub: tokenInfoPayload.sub,
      aud: tokenInfoPayload.aud,
      exp: tokenInfoPayload.exp,
      email: tokenInfoPayload.email,
      scope: tokenInfoPayload.scope,
    });

    // check googleId if exists in database
    const googleId = tokenInfoPayload.sub;
    console.log(`[${now()}] Looking up user by googleId:`, googleId);
    console.time('db.findOne.googleId');
    const existingUser = await User.findOne({ googleId: googleId });
    console.timeEnd('db.findOne.googleId');

    if (existingUser) {
      req.user = existingUser;
      console.log(`[${now()}] User found in database:`, {
        _id: existingUser._id,
        email: existingUser.email,
        name: existingUser.name || `${existingUser.first_name || ''} ${existingUser.last_name || ''}`.trim(),
        connectAccount: existingUser.connectAccount,
      });
      // Return HTTP response for existing user
      const token = jwt.sign({ user_id: existingUser._id }, config.jwtSecret);
      return res.json(successResponse({
        token: token,
        message: 'User authenticated via Google (existing account).',
        user: {
          id: existingUser._id,
          email: existingUser.email,
          name: existingUser.name,
        },
      }));
    } else {
      console.log(`[${now()}] No existing user found for googleId, proceeding with registration...`);
    }

    console.log(`[${now()}] Step 2: Calling Google userinfo for detailed profile...`);
    const userInfoResponse = await axios.get(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    console.log(`[${now()}] userinfo response status:`, userInfoResponse.status);
    userInfoPayload = userInfoResponse.data;
    console.log(`[${now()}] userinfo payload (selected):`, {
      sub: userInfoPayload.sub,
      email: userInfoPayload.email,
      given_name: userInfoPayload.given_name,
      family_name: userInfoPayload.family_name,
      name: userInfoPayload.name,
      picture: userInfoPayload.picture,
    });

    if (tokenInfoPayload.sub !== userInfoPayload.sub) {
      console.error(`[${now()}] Sub ID mismatch between tokeninfo and userinfo! tokeninfo.sub=%s userinfo.sub=%s`, tokenInfoPayload.sub, userInfoPayload.sub);
      throw new Error('User identification mismatch.');
    }

    console.log(`[${now()}] Creating new user in local database...`);
    console.time('db.create.user');
    const localUser = await User.create({
      googleId: googleId,
      email: userInfoPayload.email,
      first_name: userInfoPayload.given_name,
      last_name: userInfoPayload.family_name,
      name: userInfoPayload.name,
      picture: userInfoPayload.picture,
      password_hash: Math.random().toString(36).slice(-8),
      connectAccount: 'Google'
    });
    console.timeEnd('db.create.user');

    console.log(`[${now()}] New user registered in DB:`, {
      _id: localUser._id,
      email: localUser.email,
      name: localUser.name,
      connectAccount: localUser.connectAccount
    });
    const token = jwt.sign({ user_id: localUser._id }, config.jwtSecret);
    return res.json(successResponse({
      message: 'User successfully authenticated and registered via Google.',
      token: token,
      user: {
        id: localUser._id,
        email: localUser.email,
        name: localUser.name,
      }
    }));

  } catch (error) {
    const errorMessage = error.response
      ? (error.response.data?.error_description || error.response.data?.error || JSON.stringify(error.response.data))
      : error.message;
    console.error(`[${now()}] Google token processing failed:`, {
      message: errorMessage,
      stack: error.stack,
    });

    // If axios error, log status and headers for debugging
    if (error.response) {
      console.error(`[${now()}] Axios response debug:`, {
        status: error.response.status,
        headers: error.response.headers,
        dataSample: (() => {
          try {
            const d = error.response.data;
            if (!d) return null;
            // limit size of logged body
            const s = JSON.stringify(d);
            return s.length > 1000 ? s.slice(0, 1000) + '... [truncated]' : s;
          } catch (e) {
            return 'unserializable response data';
          }
        })()
      });
    }

    return res.json(errorResponse({
      message: 'Authentication failed: Invalid or expired Google Access Token.'
    }));
  }
};

const requireSignin = expressjwt({
  secret: config.jwtSecret,
  algorithms: ["HS256"],
  userProperty: "auth",
});

const hasAuthorization = (req, res, next) => {
  const authorized = req.profile && req.auth && req.profile._id == req.auth.user_id;
  if (!authorized) {
    return res.json(errorResponse({
      message: "User is not authorized",
    }));
  }
  next();
};


export default { signup, signin, signout, requireSignin, hasAuthorization, googleLogin };
