import { Card, Button, Row, Col, CardBody } from 'reactstrap';
import { GoogleLogin } from 'react-google-login';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { saveConfigData } from '../_services/config';
import { useAuthContext } from '../_context/authContext';
import { toast } from 'react-toastify';
import { gapi } from 'gapi-script';
import dynamic from 'next/dynamic';

const DisconnectModal = dynamic(import('./Utils/DisconnectModal'));
const DBConfigModal = dynamic(import('./Utils/DBConfigModal'));

const Configure = () => {
  const { setIsDriveConnected, configData, setConfigData, setIsContextLoaded, setIsLoggedIn } = useAuthContext();
  const [cloudType, setCloudType] = useState(null);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [showDBCofigModal, setShowDBConfigModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const toastConfig = {
    position: 'top-right',
    autoClose: 1500,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  };

  useEffect(() => {
    function start() {
      gapi.auth2.init({
        clientId: process.env.CLIENT_ID,
        scope: process.env.SCOPES,
      });
    }
    gapi.load('client:auth2', start);
  }, []);

  useEffect(() => {
    if (configData) {
      const cloudType = configData.cloud_type;
      if (cloudType == 1) {
        if (configData.is_connect) {
          setCloudType('GOOGLE');
        }
      } else if (cloudType == 2) {
        if (configData.is_connect) {
          setCloudType('DATABASE');
        } else {
          setCloudType('GOOGLE');
        }
      }
    }
  }, [configData]);

  async function saveConfigurationData(storage, token = '', isConnect, dbConfig) {
    let params = {};
    if (storage == 'GOOGLE') {
      params = {
        cloud_type: 1,
        auth_code: token,
        is_connect: isConnect,
      };
    } else {
      params = {
        cloud_type: 2,
        auth_code: '',
        is_connect: isConnect,
        host_name: dbConfig.hostName,
        host_database: dbConfig.dbName,
        host_user: dbConfig.userName,
        host_password: dbConfig.password,
        host_port: '3306',
      };
    }
    setLoading(true);
    const res = await saveConfigData(params);
    setLoading(false);
    setIsContextLoaded(true);
    if (res.status) {
      setConfigData(res.data);
      if (res.data.is_connect) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
      const cloudType = res.data.cloud_type;
      if (cloudType == 1) {
        if (res.data.is_connect) {
          setCloudType('GOOGLE');
          setIsDriveConnected(true);
          toast.success('Connected to Google Drive', toastConfig);
        } else {
          setIsDriveConnected(false);
        }
      } else if (cloudType == 2) {
        setIsDriveConnected(false);
        if (res.data.is_connect) {
          setCloudType('DATABASE');
          setShowDBConfigModal(false)
          toast.success('Connected to Database', toastConfig);
        } else {
          setCloudType('GOOGLE');
        }
      }
    } else {
      toast.error(res.message, toastConfig);
    }
  }

  function handleChangeCloudType(e) {
    setShowDisconnectModal(true);
  }

  function handleSocialLogin(res) {
    const accessToken = res.code;
    if (accessToken) {
      Cookies.set('_dmsToken', accessToken);
      saveConfigurationData('GOOGLE', accessToken, true);
    }
  }

  function handleGoogleLogout(res) {
    if (cloudType == 'GOOGLE') {
      setShowDBConfigModal(true);
    } else if (cloudType == 'DATABASE') {
      document.getElementById('google-drive-button').click();
    }

    setShowDisconnectModal(false);
  }

  return (
    <>
      {showDisconnectModal && (
        <DisconnectModal closeModal={() => setShowDisconnectModal(false)} disconnectAction={handleGoogleLogout} />
      )}

      {showDBCofigModal && (
        <DBConfigModal
          closeModal={() => setShowDBConfigModal(false)}
          saveConfigurationData={saveConfigurationData}
          loading={loading}
        />
      )}
      <div className="config-section">
        <h1 className="mb-3 text-secondary fs-26 mb-lg-4">Configuration</h1>
        <Row>
          <Col md="12" lg="12">
            <Card className="m-0 rounded-6">
              <CardBody className="p-4">
                <div className="row mb-3">
                  <div className="col-lg-12 mb-3">
                    <GoogleLogin
                      clientId={process.env.CLIENT_ID}
                      render={(renderProps) => (
                        <>
                          <Button
                            onClick={renderProps.onClick}
                            className="btn-google btn px-4 py-2 rounded-3 position-relative ms-auto d-none"
                            outline
                            color="primary"
                            title="Connect Google Drive"
                            id="google-drive-button"
                          >
                            Connect Google Drive
                          </Button>
                          <label className="storage-label w-100 align-items-center" htmlFor="google">
                            <input
                              name="storage"
                              id="google"
                              type="radio"
                              onChange={(e) => handleChangeCloudType(e)}
                              checked={cloudType == 'GOOGLE'}
                            />
                            <div className="storage-content align-items-center shadow-none">
                              <img src="/images/google-drive.svg" className="img-fluid" alt="google drive" />
                              <div className="storage-details">
                                <span>Upload documents on Google Drive Storage</span>
                                <p className="m-0">You can upload and manage your documents on Google Drive</p>
                              </div>
                              {cloudType == 'GOOGLE' && (
                                <Button color="success" outline className="ms-auto text-success bg-transparent">
                                  Connected
                                </Button>
                              )}
                            </div>
                          </label>
                        </>
                      )}
                      onSuccess={handleSocialLogin}
                      onFailure={handleSocialLogin}
                      discoveryDocs={process.env.DISCOVERY_DOCS}
                      accessType="offline"
                      responseType="code"
                      prompt="consent"
                      scope={process.env.SCOPES}
                    />
                  </div>
                  <div className="col-lg-12 mb-3">
                    <label className="storage-label w-100 align-items-center" htmlFor="database">
                      <input
                        name="storage"
                        type="radio"
                        id="database"
                        onChange={(e) => handleChangeCloudType(e)}
                        checked={cloudType == 'DATABASE'}
                      />
                      <div className="storage-content align-items-center shadow-none">
                        <img src="/images/database.svg" className="img-fluid" alt="Database" />
                        <div className="storage-details">
                          <span>Upload documents on Database</span>
                          <p className="m-0">You can upload and manage your documents in our database</p>
                        </div>
                        {cloudType == 'DATABASE' && (
                          <Button color="success" outline className="ms-auto text-success bg-transparent">
                            Connected
                          </Button>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default Configure;
