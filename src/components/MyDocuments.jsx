import { Row, Col, Card, CardBody, Button } from 'reactstrap';
import { useEffect, useState } from 'react';
import { downloadFileData, getFilesData, searchFileData, viewFileData } from '../_services/config';
import moment from 'moment/moment';
import { toast } from 'react-toastify';
import { useAuthContext } from '../_context/authContext';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import GoogleLogin from 'react-google-login';
import { gapi } from 'gapi-script';
import Cookies from 'js-cookie';

const TableLoader = dynamic(import('./Utils/TableLoader'));
const DataTable = dynamic(import('./DataTable'));

const MyDocuments = () => {
  const { isLoggedIn, isContextLoaded, configData } = useAuthContext();
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [tableData, setTableData] = useState([]);

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
    if (isLoggedIn && searchInput == '') {
      handleGetFileData();
    } else {
      setIsLoading(false);
    }

    if (searchInput.trim()) {
      const timer = setTimeout(() => {
        searchFiles();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, searchInput]);

  const toastConfig = {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  };

  async function handleGetFileData() {
    const res = await getFilesData();
    setIsLoading(false);
    if (res.status) {
      const data = [...res.data].map((item, idx) => {
        return { ...item, sno: idx + 1 };
      });
      setTableData(data);
    } else {
      setTableData([]);
    }
  }

  async function searchFiles() {
    const params = { file_attribute: searchInput.trim() };

    const res = await searchFileData(params);
    if (res.status) {
      setTableData(res.data);
    } else {
      setTableData([]);
    }
  }

  async function downloadFile(params) {
    const res = await downloadFileData(params);
    if (res.status) {
      window.open(res.data, '_blank');
    } else {
      toast.error(res.message, toastConfig);
    }
  }

  async function viewFile(params) {
    const res = await viewFileData(params);
    if (res.status) {
      window.open(res.data, '_blank');
    } else {
      toast.error(res.message, toastConfig);
    }
  }

  function handleGoogleLogin(res) {
    const action = Cookies.get('fileAction');
    const id = Cookies.get('fileId');

    const email = res?.profileObj?.email || '';
    if (email) {
      const params = {
        id: id,
        email: email,
      };
      if (action == 'VIEW') {
        viewFile(params);
      } else if (action == 'DOWNLOAD') {
        downloadFile(params);
      }
    }
  }

  const sortItems = (prev, curr, columnId) => {
    if (prev.original[columnId].toLowerCase() > curr.original[columnId].toLowerCase()) {
      return 1;
    } else if (prev.original[columnId].toLowerCase() < curr.original[columnId].toLowerCase()) {
      return -1;
    } else {
      return 0;
    }
  };

  function handleViewAndDownload(type, id) {
    if (configData.cloud_type == 1) {
      Cookies.set('fileAction', type);
      Cookies.set('fileId', id);
      document.getElementById('google-drive-button-doc').click();
    } else if (configData.cloud_type == 2) {
      if (type == 'VIEW') {
        window.open(`${process.env.BASE_URL}Storage/ViewFile?id=${id}`, '_blank');
      } else if (type == 'DOWNLOAD') {
        window.open(`${process.env.BASE_URL}Storage/DownloadFile?id=${id}`, '_blank');
      }
    }
  }

  const tableColumns = [
    {
      Header: 'S. No',
      accessor: 'sno',
      Cell: (cell) => {
        return <span>{cell.row.index + 1}</span>;
      },
      disableSortBy: true,
    },
    {
      Header: 'File Name',
      accessor: 'file_name',
      sortType: (prev, curr, columnId) => {
        return sortItems(prev, curr, columnId);
      },
      Cell: ({ cell }) => {
        return (
          <>
            {(cell.row.original.capabilities_can_list_children && (
              <i className="bi bi-folder fs-5 text-warning"></i>
            )) || <i className="bi bi-file-earmark fs-5 text-primary"></i>}{' '}
            <span className="ms-2">{cell.row.original.file_name}</span>
          </>
        );
      },
    },
    {
      Header: 'Timestamp',
      accessor: 'file_time_stamp',
      Cell: ({ cell }) => <span>{moment(cell.row.original.file_time_stamp).format('YYYY-MM-DD hh:mm a')}</span>,
    },
    {
      Header: 'Action',
      accessor: 'action',
      disableSortBy: true,
      Cell: ({ cell }) => {
        return (
          <>
            <>
              <i
                className="bi bi-eye fs-4 cursor-pointer"
                title="View"
                onClick={() => handleViewAndDownload('VIEW', cell.row.original.unique_id)}
                id="google-drive-button-view"
              ></i>

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
                      id="google-drive-button-doc"
                    >
                      Connect Google Drive
                    </Button>
                  </>
                )}
                onSuccess={handleGoogleLogin}
                onFailure={handleGoogleLogin}
                discoveryDocs={process.env.DISCOVERY_DOCS}
                scope={process.env.SCOPES}
              />

              <i
                className={`bi bi-cloud-download fs-4 ms-3 text-success cursor-pointer`}
                title={'Download'}
                onClick={() => handleViewAndDownload('DOWNLOAD', cell.row.original.unique_id)}
              ></i>
            </>
          </>
        );
      },
    },
  ];

  return (
    <>
      <div className="my-documents-section">
        <h1 className="mb-3 text-secondary fs-26 mb-lg-4">My Documents</h1>
        <Row>
          <Col md="12" lg="12">
            <Card className="m-0 rounded-6">
              <CardBody className="p-4">
                {isLoggedIn && (
                  <div className="mw-300 py-2 mb-3">
                    <div className="outlined-input">
                      <input
                        type="text"
                        name="name"
                        autoComplete="off"
                        className="w-100 profile-input"
                        placeholder="Search by name or keywords"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value.trimStart().replace(/  +/g, ' '))}
                      />
                      <label>Search</label>
                    </div>
                  </div>
                )}
                {isLoggedIn && !isLoading && (
                  <div className="table-responsive">
                    <DataTable columns={tableColumns} data={tableData} />
                  </div>
                )}
                {isLoading && <TableLoader />}
                {!isLoggedIn && isContextLoaded && (
                  <div className="text-center py-4">
                    <img src="/images/no-document.svg" className="img-fluid" />
                    <h4 className="mb-3 text-secondary mt-4">You are not connected with any storage!</h4>
                    <p className="mb-3 fs-16">Please connect to any cloud type to access files.</p>
                    <Link href="/configure">
                      <button className="btn px-4 py-2 rounded-3 upload-btn mt-3">Connect Now</button>
                    </Link>
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default MyDocuments;
