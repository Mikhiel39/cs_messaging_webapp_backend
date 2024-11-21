const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const app = express();
dotenv.config();

const http = require('http').Server(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
require('./socket')(io)
const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}
const conversationRoute = require("./routes/conversation");
const messageRoute = require("./routes/message");
const customerRoute = require("./routes/customer");
const agentRoute = require("./routes/agent");

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Cloud Mongodb successfully connected!"))
  .catch((err) => {
    console.log(err);
  });

app.get("/", (req,res)=>{
  console.log("API server is running");
  res.send("API server is running");
});

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/conversations", conversationRoute);
app.use("/api/messages", messageRoute);
app.use("/api/customers", customerRoute);
app.use("/api/agents", agentRoute);


http.listen(process.env.PORT || 5000, () => {
  console.log(`server is running & listening on port : ${process.env.PORT || 5000}` );
});
