import { Button, Label, Modal, Radio, Select, TextInput } from "flowbite-react";
import React, { useState } from "react";
import { MdAdd } from "react-icons/md";
import TextEditor from "./textEditor";

const AddPolicyModal = ({
  isOpen,
  toggleModal,
  handleAddPolicy,
  setIsOpen,
}) => {
  const [policy, setPolicy] = useState({ name: "", description: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPolicy({ ...policy, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAddPolicy(policy);
    setPolicy({ name: "", description: "" });
  };

  return (
    <Modal
      show={isOpen}
      size="5xl"
      popup={true}
      onClose={() => setIsOpen(!isOpen)}
    >
      <Modal.Body></Modal.Body>
    </Modal>
  );
};

export default AddPolicyModal;
