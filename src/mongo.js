import { MONGO_USERNAME, MONGO_PASSWORD} from '../credentials.json';

const url = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@lnw-mongo-uffrf.mongodb.net/lnw?retryWrites=true`;

export default url;

