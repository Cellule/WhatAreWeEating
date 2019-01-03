import * as _ from "lodash";
import * as React from "react";
import { Button, Col, FormControl, Row, Table, TableProps } from "react-bootstrap";
import Icon from "./Icon";
import "./TableSorter.css";

interface IColumn<Item> {
  name: string,
  defaultSortOrder?: "asc" | "desc" | "",
  headerProps?: object,
  // Allows to customize the data used to filter this column
  customFilterData?: ((item: Item, index?: number) => string),
  // Overwrites the filter method
  // returns a function to filter this column. True means keep this data
  // Called only if filter text is present
  customFilter?: (filterText: string, item: string) => boolean,
  // Show a combo box of choices on what to filter
  filterChoices?: string[],
  // callback to create a custom cell content
  cellGenerator?: (item: Item, index?: number) => JSX.Element,
  getItemValue?: (item: Item, index?: number) => string,
  cellProps?: (item: Item, index?: number) => object,
  // Do not render a td for that cell (make sure to disable dragging), usefull for colSpan
  skipCell?: (item: Item, index?: number) => boolean,
  // Alias for disableSorting, disableFiltering & disableDragging
  isStatic?: boolean,
  // Disable Sorting for this column only
  disableSorting?: boolean,
  // Disable Filtering for this column only
  disableFiltering?: boolean,
  // Disable Dragging for this column only
  disableDragging?: boolean,
};

interface IColumns<Item> {
  [column: string]: IColumn<Item>,
}
interface ISortType {
  column: string,
  order: "asc" | "desc" | "",
}
export interface ITableSorterConfig<Item> {
  sort: ISortType,
  columns: IColumns<Item>,
  // Default column ordering
  defaultOrdering?: string[],
}

interface ITableSorterProps<Item> extends TableProps {
  config: ITableSorterConfig<Item>,
  // Initial data in the table
  items: Item[],
  // Header repeat interval, 0 to disable
  headerRepeat?: number,
  // Disable Sorting for this table
  disableSorting?: boolean,
  // Disable Filtering for this table
  disableFiltering?: boolean,
  // Disable Dragging for this table
  disableDragging?: boolean,
  hidePager?: boolean,
  className?: string,
  loadMore?: () => Promise<void> | void,
}

interface IState {
  currentPage: number,
  columnsOrder: string[],
  fixedPositionColumns: {[columnName: string]: number;},
  filterTexts: {[columnName: string]: string;}
  sliceChoice: number,
  sort: ISortType,
}

// Inequality function map for the filtering
const operators: {[columnName: string]: (x: any, y: any) => boolean;} = {
    "<"(x: any, y: any) { return x < y; },
    "<="(x: any, y: any) { return x <= y; },
    "="(x: any, y: any) { return x === y; },
    ">"(x: any, y: any) { return x > y; },
    ">="(x: any, y: any) { return x >= y; },
};
const operandRegex = /^((?:(?:[<>]=?)|=))\s?([-]?\d+(?:\.\d+)?)$/;
const availableSlices = [5, 10, 20, 50, 100];
const defaultSliceChoice = 2;
// TableSorter React Component
type FilteredItem<Item> = Item & {__indexFromOriginalArray: number; [columnName: string]: any;};
export default class TableSorter<Item extends object> extends React.Component<ITableSorterProps<Item>, IState> {
  private static columnChangeEventID = "column change"

  constructor(props: any) {
    super(props);
    this.canSort = this.canSort.bind(this);
    this.canDrag = this.canDrag.bind(this);
    this.canFilter = this.canFilter.bind(this);
    this.getFilteredItems = this.getFilteredItems.bind(this);
    this.handleFilterTextChange = this.handleFilterTextChange.bind(this);
    this.getColumnsNameOrder = this.getColumnsNameOrder.bind(this);
    this.sortColumn = this.sortColumn.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.onPageChange = this.onPageChange.bind(this);
    this.dragStart = this.dragStart.bind(this);
    this.nextPage = this.nextPage.bind(this);
    this.previousPage = this.previousPage.bind(this);
    this.chooseSlice = this.chooseSlice.bind(this);
    this.state = this.getInitialState();
  }

  public getInitialState(): IState {
    const columns = this.props.config.columns;
    const columnsOrder = this.props.config.defaultOrdering
        ? this.props.config.defaultOrdering.filter(col => !!columns[col])
        : Object.keys(columns);

    return {
      columnsOrder,
      currentPage: 1,
      filterTexts: {},
      fixedPositionColumns: columnsOrder.reduce((fixedPositionColumns, colName, i) => {
        const col = columns[colName];
        if(!this.canDrag(col)) {
          fixedPositionColumns[colName] = i;
        }
        return fixedPositionColumns;
      }, {} as {[columnName: string]: number;}),
      sliceChoice: defaultSliceChoice,
      sort: this.props.config.sort || { column: "", order: "" },
    };
  }

  public render() {
    const {
      config,
      items,
      headerRepeat,
      hidePager,
      disableSorting,
      disableFiltering,
      disableDragging,
      className,
      loadMore,
      ...others
    } = this.props;

    const {
      filterTexts,
      sliceChoice,
      sort,
    } = this.state;

    const allRows: any[] = [];
    const columnNames = this.getColumnsNameOrder();
    const filteredItems = this.getFilteredItems();
    const totalItems = filteredItems.length;

    /////////////////////////////////////////////////////////////////////////
    // Sort data
    let sortedItems;
    if(!disableSorting) {
      sortedItems = _.sortBy(filteredItems, sort.column);
      if (sort.order === "desc") {
        sortedItems.reverse();
      }
    } else {
      sortedItems = filteredItems;
    }
    /////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////
    // Pagination
    let startSlice = 0;
    let endSlice = 0;
    if(!hidePager) {
      endSlice = this.getCurrentSlice();
      startSlice = endSlice - availableSlices[this.state.sliceChoice];
      endSlice = Math.min(endSlice, totalItems);
      sortedItems = sortedItems.slice(startSlice, endSlice);
    }
    /////////////////////////////////////////////////////////////////////////

    // Create headers
    const header = columnNames.map((col, i) => {
      const columnConfig = config.columns[col];
      const headerName = config.columns[col].name;

      let headerRender;
      const enableSorting = this.canSort(columnConfig);
      if(enableSorting) {
        headerRender = (extraIcon2: any) => {
          let sortIcon = "sort";
          const isSortingThisColumn = sort.column === col;
          if(isSortingThisColumn) {
            sortIcon += "-" + sort.order;
          }
          const icon = (<Icon library="fa" glyph={sortIcon} />);
          return (
            <Button onClick={this.sortColumn(col)} bsStyle="link" block={true}>
              {extraIcon2} {headerName} {icon}{" "}
            </Button>
          );
        }
      } else {
        headerRender = (extraIcon2: any) => {
          // FIXME:: Style is a quick fix for prototype, change when real style decided
          return (
            <div
              className="btn btn-link"
              style={{width: "100%", cursor: "default"}}
            >
              {extraIcon2} {headerName}
            </div>
          );
        }
      }

      const enableDragging = this.canDrag(columnConfig);
      let dragProps = {};
      let extraIcon: any = null;
      if(enableDragging) {
        extraIcon = <Icon
          glyph="bars"
          onDragStart={this.dragStart.bind(this, i)}
          draggable={true}
          className="draggable pull-left hidden-xs"
        />;
        dragProps = {
          onDragOver(e: any) {e.preventDefault();},
          onDrop: this.onDrop.bind(this, i),
        };
      }

      return (
        <th
          key={i}
          {...dragProps}
          {...columnConfig.headerProps}
        >
          {headerRender(extraIcon)}
        </th>
      );
    });

    // Create filter fields
    let filterInputs: JSX.Element[] | null = null;
    if(!disableFiltering) {
      filterInputs = columnNames.map((c, i) => {
        if (this.canFilter(config.columns[c])) {
          const column: IColumn<Item> = config.columns[c];
          const filterText = filterTexts[c];
          return (
            <td key={i}>
              {column.filterChoices ? (
                <FormControl
                  id={`filter-${c}-${i}`}
                  componentClass="select"
                  value={filterText || ""}
                  onChange={this.handleFilterTextChange(c)}
                >
                  <option key="default" value="">Filter by: {column.name}</option>
                  {column.filterChoices.map(choice => (
                    <option key={choice} value={choice}>{choice}</option>
                  ))}
                </FormControl>
              ) : (
                <FormControl
                  id={`filter-${c}-${i}`}
                  type="text"
                  placeholder={"Filter by: " + column.name}
                  value={filterText || ""}
                  onChange={this.handleFilterTextChange(c)}
                />
              )}
            </td>
          );
        }
        return <td key={i} />;
      });
    }

    // Extra header generator
    const headerExtra = () => {
      return columnNames.map((c, i) => {
        return <th key={i}>{config.columns[c].name}</th>;
      }, this);
    };

    // Row generator
    const rowGenerator = (item: FilteredItem<Item>, iItem: number) => {
      return columnNames.map((colName, i) => {
        const columnConfig = config.columns[colName];
        if (columnConfig.skipCell && columnConfig.skipCell(item, item.__indexFromOriginalArray)) {
          return null;
        }
        const content =
          columnConfig.cellGenerator ? columnConfig.cellGenerator(item, item.__indexFromOriginalArray) :
          columnConfig.getItemValue ? columnConfig.getItemValue(item, item.__indexFromOriginalArray) :
          item[colName];
        const props = columnConfig.cellProps ? columnConfig.cellProps(item, item.__indexFromOriginalArray) : null;
        return (
          <td key={i} {...props}>
            {content}
          </td>
        );
      });
    };

    // Create all rows
    sortedItems.forEach((item, i) => {
      if (
        headerRepeat &&
        (headerRepeat > 0) &&
        (i > 0) &&
        (i % headerRepeat === 0)
      ) {
        allRows.push (
          <tr key={"extra" + i}>
            {headerExtra()}
          </tr>
        )
      }

      allRows.push(
        <tr key={i}>
          {rowGenerator(item, i)}
        </tr>
      );
    });

    if (loadMore && endSlice >= totalItems) {
      allRows.push(
        <tr key="loadmore">
          <td colSpan={columnNames.length}>
            <Button onClick={loadMore}>Load More...</Button>
          </td>
        </tr>
      )
    }

    let pager;
    if(!hidePager) {
      const currentPage = this.state.currentPage;
      const totalPages = Math.ceil(
        totalItems / availableSlices[this.state.sliceChoice]
      );
      const makeArrow = (onClick: any, disabled: boolean, icon: string, srText: string) => {
        return (
          <li key={srText} className={disabled ? "disabled": ""} title={srText}>
            <span onClick={!disabled ? onClick : undefined}>
              <Icon glyph={icon} />
              <span className="sr-only">{srText}</span>
            </span>
          </li>
        );
      }
      const goToPreviousPage = makeArrow(
        _.partial(this.previousPage, 1),
        currentPage === 1,
        "angle-left",
        "previous"
      );
      const goToNextPage = makeArrow(
        _.partial(this.nextPage, 1),
        currentPage === totalPages,
        "angle-right",
        "next"
      );
      const goToFirstPage = makeArrow(
        _.partial(this.onPageChange, 1),
        currentPage === 1,
        "angle-double-left",
        "first"
      );
      const goToLastPage = makeArrow(
        _.partial(this.onPageChange, totalPages),
        currentPage === totalPages,
        "angle-double-right",
        "last"
      );
      const loadMorePager = loadMore ? makeArrow(
        loadMore,
        false,
        "plus",
        "Load More..."
      ) : null;
      const firstPageShown = Math.max(currentPage - 2, 1);
      const lastPageShown = Math.min(firstPageShown + 5, totalPages + 1);

      const pages = _.map(_.range(firstPageShown, lastPageShown), (pageNumber) => {
        const isCurrentPage = pageNumber === currentPage;
        const activeClass = isCurrentPage && "active" || undefined;
        const onClick = !isCurrentPage ? _.partial(this.onPageChange, pageNumber) : undefined;
        return (
          <li key={pageNumber} className={activeClass}>
            <span onClick={onClick}>
              {pageNumber}
            </span>
          </li>
        );
      });
      pager = (
        <nav>
          <ul className="pagination">
            {goToFirstPage}
            {goToPreviousPage}
            {pages}
            {goToNextPage}
            {goToLastPage}
            {loadMorePager}
          </ul>
        </nav>
      );
    } else {
      pager = null;
    }

    const tableClassName = (className || "").toString() + " table-sorter";
    return (
      <div>
        <Row key="table">
          <Col xs={12}>
            <Table
              className={tableClassName}
              cellSpacing="0"
              {...others}
            >
              <thead>
                <tr>
                  {header}
                </tr>
                {!disableFiltering ? (
                  <tr className="table-sorter-filter-row tr-tight-form-group">
                    {filterInputs}
                  </tr>
                ) : null }
              </thead>
              <tbody>
                {allRows}
              </tbody>
            </Table>
          </Col>
        </Row>
        {!hidePager ? [
          <Row key="pagerOptions">
            <Col xs={12}>
              <span>
                {`Results ${!endSlice ? 0 : startSlice + 1} - ${endSlice} of ${totalItems}`}
              </span>
              <span className="pull-right">
                {"Results per page: "}
                {_.map(availableSlices, (slice, i) => {
                  const separator = i === availableSlices.length - 1 ? "" : ", ";
                  let link;
                  if(i === sliceChoice) {
                    link = <span>{slice}</span>;
                  } else {
                    link = (
                      <span
                        className="btn-link pointer"
                        onClick={_.partial(this.chooseSlice, i)}
                      >
                        {slice}
                      </span>
                    );
                  }
                  return (
                    <span key={i}>
                      {link}
                      {separator}
                    </span>
                  );
                })}
              </span>
            </Col>
          </Row>,
          <Row key="pager">
            <Col xs={12} className="text-center">
              {pager}
            </Col>
          </Row>
        ] : null}
      </div>
    );
  }

  private canSort(col: IColumn<Item>) {
    return !(this.props.disableSorting || col.isStatic || col.disableSorting);
  }

  private canDrag(col: IColumn<Item>) {
    return !(this.props.disableDragging || col.isStatic || col.disableDragging);
  }

  private canFilter(col: IColumn<Item>) {
    return !(this.props.disableFiltering || col.isStatic || col.disableFiltering);
  }

  private handleFilterTextChange(column: string) {
    return (e: any) => {
      const newValue = e.target.value;
      const filterTexts = this.state.filterTexts;
      filterTexts[column] = newValue;
      this.setState({
        ...this.state,
        currentPage: 1,
        filterTexts
      });
    };
  }

  private getFilteredItems(): Array<FilteredItem<Item>> {
    const columnNames = this.getColumnsNameOrder();
    const columns = this.props.config.columns;
    const filters: {[columnName: string]: any;} = {};
    const items: Array<FilteredItem<Item>> = this.props.items.map((item, i) =>
      Object.assign({__indexFromOriginalArray: i}, item)
    );

    let filteredItems = items;
    if(!this.props.disableFiltering) {
      let hasFilterText = false;
      columnNames.forEach(columnName => {
        const column = columns[columnName];
        const filterText = this.state.filterTexts[columnName];
        filters[columnName] = null;

        if (filterText && filterText.length > 0) {
          hasFilterText = true;
          if(column.customFilter) {
            filters[columnName] = _.partial(column.customFilter, filterText);
          } else {
            const operandMatch = operandRegex.exec(filterText);
            if (operandMatch && (operandMatch.length === 3) ) {
              filters[columnName] = (match =>
                (x: string) => operators[match[1]](x, match[2])
              )(operandMatch);
            } else {
              filters[columnName] = ((text: string) =>
                (x: string) => (x||"").toString().toLowerCase().indexOf(text.toLowerCase()) !== -1
              )(filterText);
            }
          }
        }
      });
      if(hasFilterText) {
        filteredItems = _.reduce(columnNames, (filteredItems2, c) => {
          if(!filters[c]) {
            return filteredItems2;
          }
          const filter = filters[c];
          const getter = columns[c].customFilterData || columns[c].getItemValue || ((item: Item & {[columnName: string]: any;}, i?: number) => item[c]);
          return filteredItems2.filter(item =>
            filter(getter(item, item.__indexFromOriginalArray))
          )
        }, items);
      }
    }
    return filteredItems;
  }

  private getColumnsNameOrder() {
    return this.state.columnsOrder;
  }

  private sortColumn(column: string) {
    return () => {
      const newSortOrder = this.state.sort.column !== column
        ? this.props.config.columns[column].defaultSortOrder || "asc"
        : (this.state.sort.order === "asc") ? "desc" : "asc";

      this.setState({
        ...this.state,
        sort: { column, order: newSortOrder }
      });
    };
  }

  private dragStart(i: any, e: any) {
    const data = {
      event: TableSorter.columnChangeEventID,
      index : i,
    }
    e.dataTransfer.setData("text", JSON.stringify(data));
  }

  private onDrop(i: any, e: any) {
    const data = JSON.parse(e.dataTransfer.getData("text"));
    const columnsOrder = this.getColumnsNameOrder();
    if(
      data.event === TableSorter.columnChangeEventID &&
      _.isNumber(data.index) &&
      data.index >= 0 &&
      data.index < columnsOrder.length &&
      data.index !== i
    ) {
      const draggedColumn = columnsOrder.splice(data.index, 1);
      columnsOrder.splice(i, 0, draggedColumn[0]);
      // makes sure static columns haven't moved
      if(!_.isEmpty(this.state.fixedPositionColumns)) {
        const l = columnsOrder.length;
        const checkStaticColumn = (iCol: number) => {
          // check if static column is misplaced
          const colStaticIndex = this.state.fixedPositionColumns[columnsOrder[iCol]];
          if(colStaticIndex !== undefined && colStaticIndex !== iCol) {
            // put it back in its place
            const col = columnsOrder.splice(iCol, 1);
            columnsOrder.splice(colStaticIndex, 0, col[0]);
          }
        };

        // the traversing order is important depending on how the change was made
        if(i > data.index) {
          for (let i2 = l - 1; i2 >= 0; i2--) {
            checkStaticColumn(i2);
          }
        } else {
          for (let i3 = 0; i3 < l; i3++) {
            checkStaticColumn(i3);
          }
        }
      }
      this.setState({
        ...this.state,
        columnsOrder
      });
    }
  }

  private getCurrentSlice() {
    return availableSlices[this.state.sliceChoice] * this.state.currentPage;
  }

  private onPageChange(page: number) {
    this.setState({
      ...this.state,
      currentPage: page
    });
  }

  private nextPage() {
    const page = this.state.currentPage + 1;
    this.onPageChange(page);
  }

  private previousPage() {
    const page = this.state.currentPage - 1;
    this.onPageChange(page);
  }

  private chooseSlice(sliceChoice: number) {
    this.setState({
      ...this.state,
      currentPage: 1,
      sliceChoice
    });
  }
}
