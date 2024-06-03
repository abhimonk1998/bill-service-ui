import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import axios from "axios";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

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
      setImageUrl(objectUrl);
      console.log("Object URL is", objectUrl);
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
