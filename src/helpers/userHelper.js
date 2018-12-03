export async function checkEmail(collection, email) {
  try {
    const userExist = await collection.find({ email }).limit(1).count();
    return !!userExist;
  } catch (err) {
    console.log("Error: ", err);
  }
}

export async function checkNickname(collection, nickname) {
  try {
    const userExist = await collection.find({ nickname }).limit(1).count();
    return !!userExist;
  } catch (err) {
    console.log(err);
  }
}

export async function checkSocialID(collection, provider, providerID) {
  try {
    const user = await collection.findOne({
      [`${provider}ID`]: providerID
    });
    // returns null if user is not found
    return user;
  } catch (err) {
    console.log("Error: ", err);
  }
}

export async function registerNewUser(mongo, provider, profile, done) {
  try {
    const newUserResponse = await mongo.User.insertOne({
      nickname: profile.displayName,
      [`${provider}ID`]: profile.id,
      createdAt: Date.now()
    });
    const newUser = newUserResponse.ops[0];
    return done(null, { user: newUser });
  } catch (err) {
    return done(err);
  }
}

export async function hashPassword(password) {}

export async function registerWithEmail(collection, input) {}
