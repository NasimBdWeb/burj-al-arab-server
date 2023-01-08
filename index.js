
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const admin = require("firebase-admin");

const  {getAuth}  = require('firebase-admin/auth');
const dotenv = require('dotenv')


app.use(express.json())
app.use(bodyParser.json())
app.use(cors())
const port = 4000

dotenv.config({path:'./config.env'})


const serviceAccount = require("./burj-al-arab-44110-firebase-adminsdk-4tx99-b10d4f6547.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.DATABASE;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const collection = client.db("sampledb").collection("products");
  

  app.post('/addBooking', (req,res)=>{
       const newBookings = req.body;
       collection.insertOne(newBookings)
       .then(result =>{
          res.send(result.insertedCount > 0)
       })
})
  
  app.get('/bookinglist',(req,res)=> {
      const bearer = req.headers.authorization;
      if(bearer && bearer.startsWith("Bearer ")){
        const idToken = bearer.split(" ")[1];
       
        getAuth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
          const queryEmail = req.query.email;
          console.log(queryEmail , tokenEmail)
          if(tokenEmail == queryEmail) {
            collection.find({email : queryEmail})
            .toArray((err,document)=>{
              res.status(200).send(document)
            })
          }
          else{
            res.status(401).send('unauthorized access denied')
          }
        })
        .catch((error) => {
          
        });
      }
   

     
  })       

})





app.listen(port,()=>{
  console.log('listening on port 4000')
})