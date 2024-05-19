import React, { useState } from "react";
import { Form, Button, ListGroup } from "react-bootstrap";

const PersonList = ({ onPersonsChange }) => {
  const [person, setPerson] = useState("");
  const [persons, setPersons] = useState([]);

  const handleAddPerson = () => {
    if (person) {
      const newPersons = [...persons, person];
      setPersons(newPersons);
      onPersonsChange(newPersons);
      setPerson("");
    }
  };

  return (
    <div>
      <Form.Group controlId="formPerson" className="mb-3">
        <Form.Label>Add Person</Form.Label>
        <Form.Control
          type="text"
          value={person}
          onChange={(e) => setPerson(e.target.value)}
        />
      </Form.Group>
      <Button variant="primary" onClick={handleAddPerson}>
        Add Person
      </Button>
      <ListGroup className="mt-3">
        {persons.map((person, index) => (
          <ListGroup.Item key={index}>{person}</ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default PersonList;
