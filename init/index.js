const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const mongo_Url = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then((res) => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(mongo_Url);
}

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "68fc58e8a397cdd45959a01d",
  }));
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

initDB();
