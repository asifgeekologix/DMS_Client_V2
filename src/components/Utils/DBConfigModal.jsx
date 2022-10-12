import React, { useState } from 'react';
import { Modal, Spinner } from 'react-bootstrap';
import { Button } from 'reactstrap';

function DBConfigModal(props) {
  const { closeModal, saveConfigurationData, loading } = props;
  const [hostName, setHostName] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [dbName, setDBName] = useState('');
  const [errMsg, setErrMsg] = useState({ host: '', user: '', password: '', db: '' });

  function validation() {
    let msg = {};
    let isValidate = true;
    if (!hostName) {
      msg.host = 'Please enter host name';
      isValidate = false;
    }
    if (!userName) {
      msg.user = 'Please enter user name';
      isValidate = false;
    }
    if (!password) {
      msg.password = 'Please enter password';
      isValidate = false;
    }
    if (!dbName) {
      msg.db = 'Please enter database name';
      isValidate = false;
    }

    setErrMsg(msg);
    return isValidate;
  }

  function connectToDatabase() {
    if (validation()) {
      const params = {
        hostName,
        userName,
        password,
        dbName,
      };

      saveConfigurationData('DATABASE', '', true, params);
    }
  }

  return (
    <Modal show={true} onHide={closeModal} centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <h4 className="text-secondary m-0">Database Configuration</h4>
      </Modal.Header>
      <Modal.Body className="p-4 px-lg-5">
        <div>
          <div className="outlined-input">
            <input
              type="text"
              autoComplete="off"
              className="w-100 profile-input"
              placeholder=" "
              value={hostName}
              onChange={(e) => setHostName(e.target.value.trimStart().replace(/  +/g, ' '))}
            />
            <label>Host Name</label>
          </div>
          {errMsg.host && <small className="text-danger">{errMsg.host}</small>}
          <div className="outlined-input mt-3">
            <input
              type="text"
              autoComplete="off"
              className="w-100 profile-input"
              placeholder=" "
              value={dbName}
              onChange={(e) => setDBName(e.target.value.trimStart().replace(/  +/g, ' '))}
            />
            <label>Database Name</label>
          </div>
          {errMsg.db && <small className="text-danger">{errMsg.db}</small>}
          <div className="outlined-input mt-3">
            <input
              type="text"
              autoComplete="off"
              className="w-100 profile-input"
              placeholder=" "
              value={userName}
              onChange={(e) => setUserName(e.target.value.trimStart().replace(/  +/g, ' '))}
            />
            <label>User Name</label>
          </div>
          {errMsg.user && <small className="text-danger">{errMsg.user}</small>}
          <div className="outlined-input mt-3">
            <input
              type="password"
              autoComplete="off"
              className="w-100 profile-input"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value.trimStart().replace(/  +/g, ' '))}
            />
            <label>Password</label>
          </div>
          {errMsg.password && <small className="text-danger">{errMsg.password}</small>}
        </div>
        <div className="mt-4 d-flex justify-content-center">
          <Button outline color="danger" onClick={closeModal}>
            Cancel
          </Button>
          <Button
            className="ms-3 d-flex btn align-items-center"
            outline
            color="primary"
            onClick={connectToDatabase}
            disabled={loading}
          >
            <span>Connect</span>
            {loading && <Spinner animation="border" className="ms-2" size="sm" />}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default DBConfigModal;
