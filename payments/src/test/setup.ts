import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

jest.mock("../nats-wrapper");
declare global {
  var signin: (id?: string) => string[];
}

process.env.STRIPE_KEY = "sk_test_51PfEWa2KovIiPRmrLSyyvIrVIBpqhK0mK9LiaRRAhTTrmu164iZiPSbxn5WtvxrpPoiTXTRFc25xFyfr8ZMOC8Rl00wzPzgJys"
let mongo: MongoMemoryServer | undefined;
beforeAll(async () => {
  process.env.JWT_KEY = "asdf";
  process.env.NODE_ENV = "test";
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();
  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});

global.signin = (id?: string) => {
  const fakeJWT = jwt.sign(
    {
      id: id || new mongoose.Types.ObjectId().toHexString(),
      email: "test@test.com",
    },
    process.env.JWT_KEY!
  );

  const session = { jwt: fakeJWT };
  const sessionJSON = JSON.stringify(session);
  const base64 = Buffer.from(sessionJSON).toString("base64");

  return [`session=${base64}`];
};
