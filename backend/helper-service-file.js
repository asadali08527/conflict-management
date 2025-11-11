import express from 'express';
import cors from 'cors';

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { connectToDB } from './db';
import { ProductModel } from './product-model';

const app = express();
app.use(cors());
app.use(express.json());

const port = 3200;

/**
 * Initalise the database
 */
await connectToDB();

/**
 * Initialise s3 client
 */
const client = new S3Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const createPresignedUrlWithClient = ({ bucket, key }) => {
  const command = new PutObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(client, command, { expiresIn: 3600 });
};

app.post('/api/get-presigned-url', async (req, res) => {
  const { mime } = req.body;

  // Get the presigned url from s3
  const filename = uuidv4();
  const finalName = `${filename}.${mime}`;

  const url = await createPresignedUrlWithClient({
    bucket: process.env.S3_BUCKET_NAME,
    key: finalName,
  });

  res.json({ url: url, finalName: finalName });
});

app.post('/api/products', async (req, res) => {
  // get data from request
  const { name, description, price, filename } = req.body;

  // todo: validate the request using zod
  if (!name || !description || !price || !filename) {
    res.json({ message: 'All fields are required!' });
    return;
  }

  // Save to database
  // todo: handle error
  const product = await ProductModel.create({
    name,
    description,
    price,
    filename,
  });

  console.log('product', product);

  res.json({ message: 'success!' });
});

app.get('/api/products', async (req, res) => {
  const products = await ProductModel.find();
  res.json(products);
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
