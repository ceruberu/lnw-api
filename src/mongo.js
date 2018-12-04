const MONGO_USERNAME = process.env.MONGO_USERNAME;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;

const url = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@lnw-mongo-uffrf.mongodb.net/lnw?retryWrites=true`;

export default url;

