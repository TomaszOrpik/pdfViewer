import React from "react";
import "./App.css";
import { Document, Page } from "react-pdf/dist/esm/entry.webpack";
import moment from "moment";
import { pdfData } from "./Models/pdfData";
import { Button, TextField } from "@material-ui/core";
import Pagination from "@material-ui/lab/Pagination";
import ArrowDropUpIcon from "@material-ui/icons/ArrowDropUp";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import OpenInBrowserIcon from '@material-ui/icons/OpenInBrowser';
import GetAppIcon from '@material-ui/icons/GetApp';
import PrintIcon from '@material-ui/icons/Print';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import RefreshIcon from '@material-ui/icons/Refresh';
import Loader from "react-loader-spinner";
import printJS from 'print-js';

interface IProps {}
interface IState {
  isModalOpen: boolean;
  itemsLoaded: boolean;
  allItems: pdfData[];
  displayedItems: pdfData[];
  page: number;
  itemsPerRow: number;
  isNameSorted: boolean;
  nameSortedReversed: boolean;
  isDateSorted: boolean;
  dateSortedReverse: boolean;
  isSizeSorted: boolean;
  sizeSortedReverse: boolean;
}

export class Endpoints {
  public static baseUrl: string = "https://damlfvkdmp.cfolks.pl/myscans/";
}

class App extends React.Component<IProps, IState> {
  ///items per row to change based on resolution
  constructor(props: IProps) {
    super(props);
    this.state = {
      itemsLoaded: false,
      isModalOpen: false,
      allItems: [],
      displayedItems: [],
      page: 1,
      itemsPerRow: 5,
      isNameSorted: false,
      nameSortedReversed: false,
      isDateSorted: false,
      dateSortedReverse: false,
      isSizeSorted: false,
      sizeSortedReverse: false,
    };
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleNameSort = this.handleNameSort.bind(this);
    this.handleDateSort = this.handleDateSort.bind(this);
    this.handleSizeSort = this.handleSizeSort.bind(this);
    this.loadPdfs = this.loadPdfs.bind(this);
  }

  componentDidMount() {
    this.loadPdfs();
  }

  loadPdfs() {
    fetch(Endpoints.baseUrl)
      .then((res) => res.json())
      .then((result) => {
        this.setState({
          itemsLoaded: true,
          allItems: result,
          displayedItems: result,
        });
      })
      .catch((error) => {
        this.setState({
          itemsLoaded: true,
        });
        console.log(error);
      });
  }

  handleOpenClick = (item: pdfData) => {
    var link = document.createElement('a');
    link.href = Endpoints.baseUrl+'view/'+item.name;
    link.target = '_blank';
    link.dispatchEvent(new MouseEvent('click'));
  }
  handleDownloadClick = (item: pdfData) => {
    var link = document.createElement('a');
    link.href = Endpoints.baseUrl+'download/'+item.name;
    link.download = 'file.pdf';
    link.dispatchEvent(new MouseEvent('click'));
  }
  handlePrintClick = (item: pdfData) => {
    printJS(Endpoints.baseUrl+'view/'+item.name);
  }
  handleDeleteClick = (item: pdfData) => {
    fetch(Endpoints.baseUrl+'delete/'+item.name)
    .then(result => {
      this.loadPdfs();
      return result.text();
    })
    .then(res => console.log(res))
    .catch(error => console.log(error));
  }

  documentsRender(items: pdfData[]): JSX.Element {
    return (
      <div className="pdfsContainer">
        {items.map((item) => {
          return (
            <div key={Math.random()}>
              <Document
                className="documentContainer"
                loading={this.documentLoader}
                key={Math.random()}
                file={Endpoints.baseUrl + 'view/' + item.name}
              >
                <Page pageNumber={1} />
                <div className="documentFront">
                  <div className="docFrontBtnRow">
                  <Button className="documentFrontButton" variant="outlined" onClick={() => this.handleOpenClick(item)}>
                    <OpenInBrowserIcon fontSize="large"></OpenInBrowserIcon>
                  </Button>
                  <Button className="documentFrontButton" variant="outlined" onClick={() => this.handleDownloadClick(item)}>
                    <GetAppIcon fontSize="large"></GetAppIcon>
                  </Button>
                  </div>
                  <div className="docFrontBtnRow">
                  <Button className="documentFrontButton" variant="outlined" onClick={() => this.handlePrintClick(item)}>
                    <PrintIcon fontSize="large"></PrintIcon>
                  </Button>
                  <Button className="documentFrontButton" variant="outlined" onClick={() => this.handleDeleteClick(item)}>
                    <DeleteForeverIcon fontSize="large" color="error"></DeleteForeverIcon>
                  </Button>
                  </div>
                </div>
              </Document>
              <div className="descriptionContainer">
                <div className="documentName">{item.name}</div>
                <div className="documentDate">
                  {moment(item.createdOn).format("MMMM Do YYYY, h:mm:ss")}
                </div>
                <div className="documentSize">
                  {(item.size / 1024).toFixed(2)} KB
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  documentLoader = (
    <div className="emptyDocument">
      <div className="loadingPage">
        <Loader type="Rings" color="#00BFFF" height={80} width={80} />
      </div>
    </div>
  );

  handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    this.setState({
      page: value,
    });
  };
  handleNameSort = () => {
    const sorted = [
      ...this.state.allItems.sort((a, b) => a.name.localeCompare(b.name)),
    ];
    const reversed = !this.state.nameSortedReversed;
    this.setState({
      displayedItems: reversed ? sorted.reverse() : sorted,
      isNameSorted: true,
      nameSortedReversed: reversed,
      isDateSorted: false,
      isSizeSorted: false,
    });
  };
  handleDateSort = () => {
    const sorted = [
      ...this.state.allItems.sort((a, b) =>
        a.createdOn.toLocaleString().localeCompare(b.createdOn.toLocaleString())
      ),
    ];
    const reversed = !this.state.dateSortedReverse;
    this.setState({
      displayedItems: reversed ? sorted.reverse() : sorted,
      isNameSorted: false,
      isDateSorted: true,
      dateSortedReverse: reversed,
      isSizeSorted: false,
    });
  };
  handleSizeSort = () => {
    const sorted = [...this.state.allItems.sort((a, b) => a.size - b.size)];
    const reversed = !this.state.sizeSortedReverse;
    this.setState({
      displayedItems: reversed ? sorted.reverse() : sorted,
      isNameSorted: false,
      isDateSorted: false,
      isSizeSorted: true,
      sizeSortedReverse: reversed,
    });
  };
  handleInputChange = (input: string) => {
    if (input === "") {
      this.setState({
        displayedItems: this.state.allItems,
        isNameSorted: false,
        isDateSorted: false,
        isSizeSorted: false,
      });
    } else {
      const filtered = [
        ...this.state.allItems.filter((p) => p.name.includes(input)),
      ];
      this.setState({
        displayedItems: filtered,
        isNameSorted: false,
        isDateSorted: false,
        isSizeSorted: false,
      });
    }
    console.log(input);
  };

  render() {
    return (
      <div className="appBody">
        {this.state.itemsLoaded ? (
          <div>
            <div className="functionsBar">
              <div className="sortButtons">
                <div className="sortTitle">Sort by:</div>
                <Button
                  className={
                    this.state.isNameSorted ? "sortButton active" : "sortButton"
                  }
                  variant="outlined"
                  onClick={this.handleNameSort}
                >
                  NAME{" "}
                  {this.state.nameSortedReversed ? (
                    <ArrowDropDownIcon></ArrowDropDownIcon>
                  ) : (
                    <ArrowDropUpIcon></ArrowDropUpIcon>
                  )}
                </Button>
                <Button
                  className={
                    this.state.isDateSorted ? "sortButton active" : "sortButton"
                  }
                  variant="outlined"
                  onClick={this.handleDateSort}
                >
                  DATE{" "}
                  {this.state.dateSortedReverse ? (
                    <ArrowDropDownIcon></ArrowDropDownIcon>
                  ) : (
                    <ArrowDropUpIcon></ArrowDropUpIcon>
                  )}
                </Button>
                <Button
                  className={
                    this.state.isSizeSorted ? "sortButton active" : "sortButton"
                  }
                  variant="outlined"
                  onClick={this.handleSizeSort}
                >
                  SIZE{" "}
                  {this.state.sizeSortedReverse ? (
                    <ArrowDropDownIcon></ArrowDropDownIcon>
                  ) : (
                    <ArrowDropUpIcon></ArrowDropUpIcon>
                  )}
                </Button>
              </div>
                <Button className="refreshButton" variant="outlined" onClick={this.loadPdfs}>
                  <RefreshIcon></RefreshIcon>
                </Button>
              <div className="searchContainer">
                <TextField
                  label="Filter by Name"
                  variant="outlined"
                  onChange={(e) => this.handleInputChange(e.target.value)}
                />
              </div>
            </div>
            <div className="rendersParent">
              {this.documentsRender(
                this.state.displayedItems.slice(
                  (this.state.page - 1) * (this.state.itemsPerRow * 2),
                  (this.state.page - 1) * (this.state.itemsPerRow * 2) +
                    this.state.itemsPerRow
                )
              )}
              {(this.state.page - 1) * (this.state.itemsPerRow * 2) +
                this.state.itemsPerRow <
              this.state.displayedItems.length
                ? this.documentsRender(
                    this.state.displayedItems.slice(
                      (this.state.page - 1) * (this.state.itemsPerRow * 2) +
                        this.state.itemsPerRow,
                      (this.state.page - 1) * (this.state.itemsPerRow * 2) +
                        2 * this.state.itemsPerRow
                    )
                  )
                : null}
            </div>
            <div className="paginationContainer">
              <div style={{ marginRight: "auto" }}></div>
              <Pagination
                color="primary"
                style={{ marginRight: "10px" }}
                page={this.state.page}
                onChange={this.handlePageChange}
                count={Math.ceil(
                  this.state.displayedItems.length /
                    (this.state.itemsPerRow * 2)
                )}
                showFirstButton
                showLastButton
              />
            </div>
          </div>
        ) : (
          <div className="loadingPage">
            <Loader type="Rings" color="#00BFFF" height={80} width={80} />
          </div>
        )}
      </div>
    );
  }
}

export default App;
