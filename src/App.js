// STYLES REGION
import "./App.css";
import "./bootstrap.css";

// REACT LIB REGION
import { useRef, useState } from "react";
import * as XLSX from "xlsx";

// MATERIAL UI REGION
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';

import AWS from 'aws-sdk'

// AWS UTILS REGION

AWS.config.update({
  region: 'us-east-1', // Put your aws region here
  accessKeyId: process.env.REACT_APP_AWS_ACCES_KEY,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY
});

const s3 = new AWS.S3({
  params: { Bucket: process.env.REACT_APP_BUCKET_NAME },
  region: 'us-east-1'
});

function App() {

  const fileInput = useRef();

  const [file, setFile] = useState(null);

  const [book, setBook] = useState(null);

  const [sheets, setSheets] = useState([]);

  const [csvFiles, setCsvFiles] = useState([]);

  console.log(process.env);

  const handleSubmit = (e) => {

    let tempCsvFiles = sheets.filter(s => s.checked === true).map(
      function (e) {
        let output = XLSX.utils.sheet_to_csv(book.Sheets[e.name], { header: e.header });
        return {
          fileName: `${e.name}.csv`,
          body: output
        };
      }
    );
    setCsvFiles(tempCsvFiles);

    handleUpload(tempCsvFiles);

    e.preventDefault();
  };

  const handleFileInput = (e) => {
    let tempFile = fileInput.current.files[0];
    if (tempFile !== undefined) {
      console.log(tempFile);
      setFile(tempFile);
      const reader = new FileReader();
      reader.onload = (evt) => {
        const buffer = evt.target.result;
        let tempBook = XLSX.read(buffer, { type: "binary" });
        setBook(tempBook);
        // Listamos todas las hojas 
        setSheets(
          tempBook.SheetNames.map(
            function (e) {
              return {
                name: e,
                cellsRange: 'A:J',
                headersPosition: 0,
                checked: false
              }
            }
          )
        );
        console.log(sheets);
      };
      reader.readAsBinaryString(tempFile);
    }
  }

  const updateFieldChanged = index => e => {

    console.log('index: ' + index);
    console.log('property name: ' + e.target.name);
    console.log('property value: ' + e.target.value);
    console.log('property type value: ' + typeof (e.target.value));

    let newArr = [...sheets];

    let updatedItem = newArr[index];
    updatedItem[e.target.name] = e.target.value;

    newArr[index] = updatedItem;

    setSheets(newArr);
  }

  const updateCheckboxChanged = index => e => {

    let newArr = [...sheets];

    let updatedItem = newArr[index];
    updatedItem['checked'] = !updatedItem['checked'];

    newArr[index] = updatedItem;

    setSheets(newArr);
  }

  const handleUpload = (data) => {

    data.forEach(
      function (value, index, array) {

        const params = {
          //ACL: 'public-read',
          Body: value.body,
          Bucket: process.env.REACT_APP_BUCKET_NAME,
          Key: value.fileName
        };

        s3.putObject(params)
          .on('httpUploadProgress', (evt) => {
            console.log(Math.round((evt.loaded / evt.total) * 100));
            //setProgress(Math.round((evt.loaded / evt.total) * 100))
          })
          .send((err) => {
            if (err) console.log(err)
          })

      }
    );
  }

  return (
    <div className="App">
      <div className="row" style={{ padding: 20 + 'px' }}>
        <div className="col-12 columnaCentrada">
          <form onSubmit={handleSubmit}>
            <div className="row"><div className="col-12">&nbsp;<br /></div></div>
            <div className="row">
              <div className="col-12"><span className="h4">SUBIR ARCHIVO EXCEL</span></div>
            </div>
            <div className="row"><div className="col-12">&nbsp;<br /></div></div>
            <div className="row">
              <div className="col-12">
                <span className="h5">
                  Seleccione un archivo para cargar<br /><br />
                  <input type="file" ref={fileInput} onChange={handleFileInput} />
                </span></div>
            </div>
            <div className="row"><div className="col-12">&nbsp;<br /></div></div>
            <div className="row">
              <div className="col-12"></div>
            </div>
            <div className="row"><div className="col-12">&nbsp;<br /></div></div>
            <div className="row">
              <div className="col-12"><button type="submit"> Cargar archivo </button></div>
            </div>
            <div className="row"><div className="col-12">&nbsp;<br /></div></div>
          </form>
        </div>
      </div>
      <div className="row" style={{ padding: 20 + 'px' }}>
        <div className="col-12" >
          <TableContainer component={Paper}>
            <table className="table table-striped table-hover">
              <thead className="thead-dark">
                <tr>
                  <th scope="col">Nombre de la hoja</th>
                  <th scope="col">A cargar</th>
                  <th scope="col">Posicion encabezados</th>
                  <th scope="col">Rango de columnas</th>
                </tr>
              </thead>
              <tbody>
                {sheets.map((object, i) => (
                  <tr key={i} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <th scope="row">{object.name}</th>
                    <td>
                      <input
                        type="checkbox"
                        id="checked"
                        value={true}
                        onChange={updateCheckboxChanged(i)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        id="headersPosition"
                        name="headersPosition"
                        value={object.headersPosition}
                        disabled={!object.checked}
                        onChange={updateFieldChanged(i)}>
                      </input>
                    </td>
                    <td>
                      <input
                        type="text"
                        id="cellsRange"
                        name="cellsRange"
                        value={object.cellsRange}
                        disabled={!object.checked}
                        onChange={updateFieldChanged(i)}
                      ></input>
                    </td>
                  </tr>

                ))}
              </tbody>
            </table>
          </TableContainer>
        </div>
      </div>


    </div>
  );
}

export default App;