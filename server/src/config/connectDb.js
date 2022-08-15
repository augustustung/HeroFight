require('dotenv').config();

const connectDb = async () => {
  // try {
  //   await mongoose.connect(`mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@cluster0.b8c1p.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`, {
  //     useNewUrlParser: true, useUnifiedTopology: true
  //   })
  //   console.log("Connection successfully!");
  // } catch (e) {
  //   console.log("Connection failed", e);
  // }
};

module.exports = connectDb;