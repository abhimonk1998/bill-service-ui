import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import axios, { isCancel, AxiosError } from "axios";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

const jsonBill = {
  items: [
    { name: "BOUNTY", price: 24.99 },
    { name: "HBO W/ALMNDS", price: 7.89 },
    { name: "WHOLE MILK", price: 6.19 },
    { name: "KS PNT BUTR", price: 9.49 },
    { name: "MNVITDUMMY", price: 15.99 },
    { name: "MNVITDUMMY", price: 13.49 },
    { name: "KS OLIVE OIL", price: 21.99 },
    { name: "CHARMIN", price: 26.49 },
    { name: "X3GGL", price: 9.79 },
    { name: "MNVITDUMMY", price: 13.49 },
    { name: "BANANA BOAT", price: 13.99 },
    { name: "KS ALMONDS", price: 14.99 },
    { name: "MNVITDUMMY", price: 15.99 },
    { name: "BNLS/SL BRST", price: 19.12 },
    { name: "RICE BASMATI", price: 12.69 },
    { name: "DAVE'S 21 WG", price: 7.59 },
    { name: "KS ORG WALNU", price: 8.99 },
    { name: "LOW CARB KET", price: 7.99 },
  ],
  tax: 11.76,
  total: 274.33,
};

const instance = axios.create({
  baseURL: "http://localhost:3001",
  headers: { "X-Custom-Header": "foobar" },
});

async function getJsonBill(s3_image_url) {
  try {
    await instance
      .post("/parse-bill", {
        bill_url: s3_image_url,
      })
      .then(function (response) {
        const jsonData = response.data.message.content;
        const jsonString = jsonData.match(/```json\n([\s\S]*?)\n```/)[1];
        const receiptData = JSON.parse(jsonString);
        return jsonString;
      })
      .catch(function (error) {
        console.log(error);
      });
  } catch (error) {
    console.error(error);
  }
}
const client = new S3Client({
  region: "us-east-2",
  credentials: {
    accessKeyId: process.env.REACT_APP_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_SECRET_ACCESS_KEY,
  },
});

async function getObjectURL(bucket, key) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  const url = await getSignedUrl(client, command);
  return url;
}

const uploadFile = async (file, presignedUrl) => {
  try {
    const response = await axios.put(presignedUrl, file, {
      headers: {
        "Content-Type": file.type,
      },
    });

    if (response.status !== 200) {
      throw new Error("Failed to upload file");
    }

    console.log("File uploaded successfully");
  } catch (error) {
    console.error("Error uploading file:", error);
  }
};

async function putObjectUrl(fileName) {
  const command = new PutObjectCommand({
    Bucket: "bills-split-bucket",
    Key: `uploads/user-uploads/${fileName}`,
  });
  const url = await getSignedUrl(client, command);
  return url;
}

const uploadToS3 = async (file, presignedUrl) => {
  await uploadFile(file, presignedUrl);
};

const ImageUpload = ({ onImageUpload }) => {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];
    setImage(selectedImage);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      console.error("No image selected");
      return;
    }

    try {
      const fileName = `bill-${Date.now()}`;
      const url = await putObjectUrl(fileName);
      console.log("Signed URL is", url);
      await uploadToS3(image, url);
      console.log("Upload success");

      const objectUrl = await getObjectURL(
        "bills-split-bucket",
        `uploads/user-uploads/${fileName}`
      );
      console.log("Object URL is", objectUrl);

      // call the back-end API. configure the url in configs
      // Important call to back-end
      // const parsedBillJson = await getJsonBill(objectUrl);

      const parsedBillJson = jsonBill;
      const jsonContent = JSON.stringify(parsedBillJson, null, 2);

      //
      setImageUrl(parsedBillJson);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group controlId="formFile" className="mb-3">
        <Form.Label>Upload Bill Image</Form.Label>
        <Form.Control type="file" onChange={handleImageChange} />
      </Form.Group>
      <Button variant="primary" type="submit">
        Upload
      </Button>
      {imageUrl && (
        <div>
          <p>Image uploaded successfully. View at:</p>
          <a href={imageUrl} target="_blank" rel="noopener noreferrer">
            {imageUrl}
          </a>
        </div>
      )}
    </Form>
  );
};

export default ImageUpload;
