const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URl = "mongodb://127.0.0.1:27017/wanderlust";

main().then(()=>{
    console.log("Connected to db");
}).catch((err)=> console.log(err));


async function main() {
    await mongoose.connect(MONGO_URl);
}


const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({...obj, owner:"69b03ef6397355d49be0c359"}))
    await Listing.insertMany(initData.data);
    console.log("Data was initialized.");
};

initDB();