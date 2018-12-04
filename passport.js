import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import { checkSocialID, registerNewUser } from "./helpers/userHelper";

import {
  FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET
} from "../credentials.json";

export default (passport, mongo) => {
  passport.use(
    new FacebookStrategy(
      {
        clientID: FACEBOOK_APP_ID,
        clientSecret: FACEBOOK_APP_SECRET,
        callbackURL: "http://localhost:4000/auth/facebook/callback"
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
        callbackURL: "http://localhost:4000/auth/google/callback"
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