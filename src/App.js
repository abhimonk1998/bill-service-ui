import "./App.css";
import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import ImageUpload from "./components/ImageUpload";
import PersonList from "./components/PersonList";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3"; // ES Modules import
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

async function wrapperGetUrl(bucket, key) {
  return await getObjectURL(bucket, key);
}

function App() {
  const [image, setImage] = useState(null);
  const [persons, setPersons] = useState([]);

  return (
    <Container>
      <Row className="mt-5">
        <Col>
          <h1>Bill Splitting App</h1>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col md={6}>
          <ImageUpload />
        </Col>
        <Col md={6}>
          <PersonList />
        </Col>
      </Row>
      {image && (
        <Row className="mt-3">
          <Col>
            <h3>Uploaded Image:</h3>
            <img src={image} alt="Uploaded bill" style={{ width: "100%" }} />
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default App;
