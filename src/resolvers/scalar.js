import { ObjectId } from 'mongodb';

export default {
  ObjectID: {
    serialize: String,
    parseValue: value =>
      ObjectId(value)
    ,
    parseLiteral: ast => 
      ObjectId(ast.value)
  }
};