import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import { checkSocialID, registerNewUser } from "./helpers/userHelper";

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const PORT = process.env.PORT || 4000;
const isProduction = process.env.NODE_ENV === "production";

const ADDRESS = isProduction ? "https://api.ceruberu.com" : `http://localhost:${PORT}`;

export default (passport, mongo) => {
  passport.use(
    new FacebookStrategy(
      {
        clientID: FACEBOOK_APP_ID,
        clientSecret: FACEBOOK_APP_SECRET,
        callbackURL: `${ADDRESS}/auth/facebook/callback`
      },
      async (accessToken, refreshToken, profile, done) => {
        const user = await checkSocialID(mongo.User, "facebook", profile.id);

        if (!user) {
          registerNewUser(mongo, "facebook", profile, done);
        }

        return done(null, user);
      }
    )
  );

  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `${ADDRESS}/auth/google/callback`
      },
      async (accessToken, refreshToken, profile, done) => {
        const user = await checkSocialID(mongo.User, "google", profile.id);

        if (!user) {
          registerNewUser(mongo, "google", profile, done);
        }

        return done(null, user);
      }
    )
  );
};
