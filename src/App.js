import "./App.css";
import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import ImageUpload from "./components/ImageUpload";
import PersonList from "./components/PersonList";

function App() {
  const [image, setImage] = useState(null);
  const [persons, setPersons] = useState([]);

  const handleImageUpload = (uploadedImage) => {
    setImage(URL.createObjectURL(uploadedImage));
  };

  const handlePersonsChange = (updatedPersons) => {
    setPersons(updatedPersons);
  };

  return (
    <Container>
      <Row className="mt-5">
        <Col>
          <h1>Bill Splitting App</h1>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col md={6}>
          <ImageUpload onImageUpload={handleImageUpload} />
        </Col>
        <Col md={6}>
          <PersonList onPersonsChange={handlePersonsChange} />
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
