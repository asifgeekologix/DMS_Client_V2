import React, { useState } from 'react';
import { Form, Modal } from 'react-bootstrap';
import { Button } from 'reactstrap';

function DrivePermissionModal(props) {
  const { closeModal } = props;

  function checkPermission() {}

  return (
    <Modal show={true} onHide={closeModal} centered>
      <Modal.Header closeButton className="border-0 pb-0"></Modal.Header>
      <Modal.Body className="pb-4 px-lg-5">
        <h4 className="text-secondary mb-3">Database Configuration</h4>
        <div></div>
        <div className="mt-3">
          <Button outline color="danger">
            Cancel
          </Button>
          <Button className="ms-3" outline color="primary" onClick={checkPermission}>
            Connect
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default DrivePermissionModal;
