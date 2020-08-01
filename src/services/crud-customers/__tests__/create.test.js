// requires do test
const mongoose = require("mongoose");
const mockingoose = require("mockingoose").default;
const { createConnection } = require("../../../database/mongo/connection");
const { handler } = require("../endpoints/create");
const Customer = require("../../../database/mongo/models/Customer");

// mock opcional pois require do mockingoose ja mock a conexão
jest.mock("../../../database/mongo/connection");

jest.mock("aws-sdk", () => {
  return {
    SNS: function () {
      return {
        publish: () => {
          return {
            promise: () => { },
          };
        },
      };
    },
  };
});

describe("Create customer:", () => {
  const _id = new mongoose.Types.ObjectId().toHexString();
  const customer = {
    _id,
    name: "kenny",
    email: "kem@gmail.com",
    cpf: "01234567891",
    password: "12345678",
    birthdate: "2000-01-01",
  }; // exemplo de um objeto de cadastro de customer

  const context = {};

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  beforeAll(() => {
    createConnection.mockImplementation(() => Promise.resolve());
  });

  it("verify customer ceated successfully:", async (done) => {
    mockingoose(Customer).toReturn(customer, "save"); // simula o metodo save do customer
    const event = { body: JSON.stringify(customer) };

    const result = await handler(event, context);

    expect(result).toHaveProperty("statusCode", 200);
    expect(result).toHaveProperty("body");
    expect(JSON.parse(result.body)).toHaveProperty("data");

    done();
  });

  it("testing creation driver error", async (done) => {
    const context = {};
    const event = { body: JSON.stringify(customer) }; // sem stringify

    const err = new mongoose.Error.ValidationError();

    mockingoose(Customer).toReturn(err, "save");

    const result = await handler(event, context);

    expect(result).toHaveProperty("statusCode", 400);
    expect(result).toHaveProperty("body");
    done();
  });

  it("create customer error", async (done) => {
    const event = { body: JSON.stringify(customer) };

    mockingoose(Customer).toReturn(new Error("Timeout"), "save");

    try {
      await handler(event, context);
    } catch (err) {
      expect(err.message).toEqual("Timeout");
    }

    done();
  });
});
