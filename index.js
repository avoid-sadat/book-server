require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

const cors = require('cors');

app.use(cors());
app.use(express.json());

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.euxm4cs.mongodb.net/?retryWrites=true&w=majority`;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9dzrk.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    const db = client.db('catalog_book');
    const productCollection = db.collection('book_collection');

    app.get('/products', async (req, res) => {
      const cursor = productCollection.find({});
      const product = await cursor.toArray();

      res.send({ status: true, data: product });
    });


    app.get('/product', async (req, res) => {
      const { genre, published_date,title,author } = req.query; // Assuming genre and publishedDate are passed as query parameters
      const query = {
        $or: [
          { genre: { $regex: `^${genre}$`, $options: 'i' } },
          { published_date: { $regex: `^${published_date}$`, $options: 'i' }},
          { title: { $regex: `^${title}$`, $options: 'i' } },
          { author: { $regex: `^${author}$`, $options: 'i' } }
        ]
      };
       // Define the case-sensitive search criteria including published date
    
      try {
        const cursor = productCollection.find(query); // Find documents matching the search criteria
        const products = await cursor.toArray(); // Convert the cursor to an array
    
        res.send({ status: true, data: products });
      } catch (error) {
        console.error(error);
        res.status(500).send({ status: false, message: 'An error occurred' });
      }
    });
    
    
    
    
    


    app.post('/product', async (req, res) => {
      const product = req.body;

      const result = await productCollection.insertOne(product);

      res.send(result);
    });

    app.get('/product/:id', async (req, res) => {
        const id = req.params.id;
        const objectId = new ObjectId(id);
        const result = await productCollection.findOne({ _id: objectId });
        console.log(result);
        res.send(result);
      });


    app.delete('/product/:id', async (req, res) => {
      const id = req.params.id;
      const objectId = new ObjectId(id);
      const result = await productCollection.deleteOne({ _id: objectId });
      console.log(result);
      res.send(result);
    });
   
    app.patch('/product/:id', async (req, res) => {
      const id = req.params.id;
      const objectId = new ObjectId(id);
      const result = await productCollection.updateOne({ _id: objectId }, { $set: req.body });
      console.log(result);
      res.send(result);
    });
    

    app.post('/comment/:id', async (req, res) => {
      const productId = req.params.id;
      const comment = req.body.comment;
      const objectId = new ObjectId(productId);
      console.log(productId);
      console.log(comment);

      const result = await productCollection.updateOne(
        { _id: objectId },
        { $push: { comments: comment } }
      );

      console.log(result);

      if (result.modifiedCount !== 1) {
        console.error('Product not found or comment not added');
        res.json({ error: 'Product not found or comment not added' });
        return;
      }

      console.log('Comment added successfully');
      res.json({ message: 'Comment added successfully' });
    });

    app.get('/comment/:id', async (req, res) => {
      const productId = req.params.id;
      const objectId =new ObjectId(productId)
      const result = await productCollection.findOne(
        { _id: objectId },
        { projection: { _id: 0, comments: 1 } }
      );

      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: 'Product not found' });
      }
    });

    app.post('/user', async (req, res) => {
      const user = req.body;

      const result = await userCollection.insertOne(user);

      res.send(result);
    });

    app.get('/user/:email', async (req, res) => {
      const email = req.params.email;

      const result = await userCollection.findOne({ email });

      if (result?.email) {
        return res.send({ status: true, data: result });
      }

      res.send({ status: false });
    });
  } finally {
  }
};

run().catch((err) => console.log(err));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
