// checkEmail(UserCollection, input.email);
// checkNickname(UserCollection, input.nickname);
// hashPassword(input.password);
// registerWithEmail(UserCollection, input);

export async function checkEmail(collection, email) {
  try {
    const userExist = await collection.find({email}).limit(1).count();
    return !!userExist;
  } catch (err) {
    console.log("Error: ", err);
  }

}

export async function checkNickname(collection, nickname) {
  try {
    const userExist = await collection.find({nickname}).limit(1).count();
    return !!userExist;
  } catch (err) {
    console.log(err);
  }
}

export async function checkFacebookID(collection, facebookID) {
  try {
    const user = await collection.findOne({facebookID});
    // returns null if user is not found
    return user;
  } catch (err) {
    console.log("Error: ", err);
  }

}

export async function hashPassword(password) {

  
}

export async function registerWithEmail(collection, input) {

  
}
