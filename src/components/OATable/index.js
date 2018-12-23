/*eslint-disable */

import React, { PureComponent } from 'react';
import classNames from 'classnames';
import moment from 'moment';
import XLSX from 'xlsx';
import {
  Row,
  Col,
  Icon,
  Table,
  Input,
  Switch,
  Button,
  Tooltip,
  message,
  Popover,
  Checkbox,
} from 'antd';
import { connect } from 'dva';
import { assign, isArray, forIn, omit, mapKeys, isBoolean } from 'lodash';
import Filter from './filters';
import Operator from './operator';
import styles from './index.less';
import TableUpload from './upload';
import Ellipsis from '../Ellipsis';
import TreeFilter from './treeFilter';
import DateFilter from './dateFilter';
import RangeFilter from './rangeFilter';
import EdiTableCell from './editTableCell';
import { makerFilters, findRenderKey, analysisData } from '../../utils/utils';

const defaultProps = {
  fileExportChange: {},
  multiOperator: null,
  extraOperator: null,
  extraOperatorRight: null,
  serverSide: false,
  excelExport: null,
  excelInto: null,
  excelTemplate: null,
  extraExportFields: [],
  filtered: 0,
  sync: true,
  operatorVisble: true,
  tableVisible: true,
  autoScroll: false,
  fetchDataSource: () => {
    // message.error('请设置fetchDataSource');
  },
};

/**
 * 超出隐藏
 * @param {table的内容} viewText
 * @param {*} tooltip
 */
function renderEllipsis(viewText, tooltip) {
  return (
    <Ellipsis tooltip={tooltip || false} lines={1}>
      {viewText}
    </Ellipsis>
  );
}

/**
 *
 * @param {替换数据源} dataSource
 * @param {替换的数组} key
 * @param {是否显示提示框} tooltip
 * @param {替换数组的键默认id，可以是对象或者一维数组} index
 * @param { 返回值的key } name
 */
function analysisColumn(
  dataSource,
  key,
  index = 'id',
  name = 'name',
  dataSourceIndex,
  tooltip = true
) {
  const value = analysisData(dataSource, key, index, name, dataSourceIndex);
  return renderEllipsis(value.join('、'), tooltip);
}

@connect()
class OATable extends PureComponent {
  constructor(props) {
    super(props);
    const columns = props.columns.map(item => ({ ...item }));
    this.columnsText = {};
    this.columnsDataIndex = columns
      .filter(item => {
        if (item.dataIndex) this.columnsText[item.dataIndex] = item;
        return item.dataIndex;
      })
      .map(item => item.dataIndex);
    this.lockColumnsDataIndex = columns
      .filter(item => item.dataIndex)
      .filter(item => item.fixed)
      .map(item => item.dataIndex);

    this.state = {
      columns,
      sorter: {},
      filters: {},
      filtered: [],
      filtersText: {},
      selectedRows: [],
      midSelectedRows: [],
      eyeVisible: false,
      selectedRowKeys: [],
      selectedRowsReal: [],
      pagination: {
        pageSize: 10,
        current: 1,
        showQuickJumper: true,
        showSizeChanger: true,
        showTotal: this.showTotal,
      },
      columnsMenuVisible: false,
      filterDropdownVisible: false,
      columnsMenuValue: columns
        .filter(item => !item.hidden && item.dataIndex)
        .map(item => item.dataIndex),
    };
  }

  componentDidMount() {
    const { data, serverSide } = this.props;
    if (!data || data.length === 0 || serverSide) {
      this.fetchTableDataSource();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { rowSelection, multiOperator, filters } = nextProps;
    if (
      multiOperator &&
      multiOperator.length > 0 &&
      rowSelection &&
      JSON.stringify(rowSelection) !== JSON.stringify(this.props.rowSelection)
    ) {
      const { selectedRowKeys, selectedRows } = rowSelection;
      this.setState({ selectedRowKeys, selectedRows });
    }
    if (JSON.stringify(filters) !== JSON.stringify(this.props.filters)) {
      this.onPropsFiltersChange(filters);
    }
    if ('columns' in nextProps) {
      this.getPropsColumnsValue(nextProps);
    }
  }

  onPropsFiltersChange = (data, key = 'filters') => {
    const thisFiltersKey = { ...this.state[key] };
    Object.keys(data).forEach(filter => {
      if (
        data[filter] === '' ||
        data[filter] === [] ||
        data[filter] === null ||
        data[filter] === undefined
      ) {
        delete thisFiltersKey[filter];
      } else {
        thisFiltersKey[filter] = data[filter];
      }
    });
    if (JSON.stringify(thisFiltersKey) !== JSON.stringify(this.state[key])) {
      let filtersText = {};
      mapKeys(thisFiltersKey, (value, filterKey) => {
        filtersText = {
          ...filtersText,
          ...this.makerFiltersText(filterKey, value),
        };
      });
      this.setState({ [key]: thisFiltersKey, filtersText }, () => {
        const { filters, sorter, pagination } = this.state;
        this.handleTableChange(pagination, filters, sorter);
      });
    }
  };

  getPropsColumnsValue = nextProps => {
    const nextColumns = nextProps.columns.map(item => ({
      filters: item.filters || [],
      treeFilters: item.treeFilters || {},
      loading: item.loading || false,
    }));
    const thisColumns = this.props.columns.map(item => ({
      filters: item.filters || [],
      treeFilters: item.treeFilters || {},
      loading: item.loading || false,
    }));
    if (JSON.stringify(nextColumns) !== JSON.stringify(thisColumns)) {
      const columns = nextProps.columns.map(item => {
        if (item.dataIndex) this.columnsText[item.dataIndex] = item;
        return { ...item };
      });
      this.setState({ columns });
    }
  };

  showTotal = (total, range) => (
    <div style={{ color: '#969696' }}>{`显示 ${range[0]} - ${range[1]} 项 , 共 ${total} 项`}</div>
  );

  fetchTableDataSource = (fetch, update = false) => {
    const { fetchDataSource, serverSide } = this.props;
    const { filters, pagination, sorter, columns } = this.state;
    let params = {};
    let urlPath = {};
    if (serverSide) {
      const filterParam = {};
      const columnDataIndex = columns.map(column => column.dataIndex);
      Object.keys(filters).forEach(key => {
        const filter = filters[key];
        if (!filter) return;
        if (columnDataIndex.indexOf(key) === -1) {
          if (typeof filter === 'string') {
            filterParam[key] = filter;
          } else {
            filterParam[key] = filter.length === 1 ? filter[0] : { in: filter };
          }
        }
      });
      columns.forEach((column, index) => {
        const key = column.dataIndex || index;
        const filter = filters[key];
        if (filter && filter.length > 0) {
          if (column.searcher) {
            filterParam[key] = { like: filter[0] };
          } else if (column.dateFilters) {
            [filterParam[key]] = filter;
          } else {
            filterParam[key] = filter.length === 1 ? filter[0] : { in: filter };
          }
        }
      });
      params = {
        filters: filterParam,
        page: pagination.current,
        pagesize: pagination.pageSize,
      };
      if (sorter.field) {
        params.sort = `${sorter.field}-${sorter.order === 'ascend' ? 'asc' : 'desc'}`;
      }
      urlPath = makerFilters(params);
    }
    if (!fetch) {
      if (update) {
        params.update = update;
        urlPath.update = update;
      }
      fetchDataSource(urlPath, params);
    } else {
      return urlPath;
    }
  };

  mapColumns = () => {
    const columns = [];
    const { filters, sorter } = this.state;
    const { serverSide } = this.props;
    this.state.columns.forEach((column, index) => {
      const key = column.dataIndex || index;
      const response = { ...column };
      if (column.hidden) {
        response.width = 0;
        response.colSpan = 0;
        response.onCell = () => ({ style: { display: 'none' } });
      }
      if (!serverSide) {
        response.sorter = column.sorter === true ? this.makeDefaultSorter(key) : column.sorter;
      }
      response.filteredValue = filters[key] || null;
      if (!sorter.field && column.defaultSortOrder) {
        sorter.field = key;
        sorter.order = column.sortOrder || column.defaultSortOrder;
      }
      response.sortOrder = sorter.field === key && sorter.order;
      if (column.searcher) {
        Object.assign(response, this.makeSearchFilterOption(key, column));
        response.render = response.render || this.makeDefaultSearchRender(key);
      } else if (column.treeFilters) {
        Object.assign(response, this.makeTreeFilterOption(key, column));
      } else if (column.filters) {
        response.onFilter = column.onFilter || this.makeDefaultOnFilter(key);
        Object.assign(response, this.makeFilterOption(key, column));
      } else if (column.dateFilters) {
        Object.assign(response, this.makeDateFilterOption(key, column));
      } else if (column.rangeFilters) {
        Object.assign(response, this.makeRangeFilterOption(key, column));
      }
      if (column.dataIndex !== undefined && !column.render) {
        const { tooltip } = column;
        const render = text => {
          let viewText = text;
          if (column.searcher) {
            viewText = this.makeDefaultSearchRender(key)(text);
          }
          return renderEllipsis(viewText, tooltip);
        };
        response.render = render;
      }
      columns.push(response);
    });
    return columns;
  };

  makeSearchFilterOption = (key, column) => {
    const { filtered, filters, filterDropdownVisible } = this.state;
    const { serverSide } = this.props;
    const cls = classNames({
      [styles['table-filter-active']]: filtered.indexOf(key) !== -1,
    });
    const searchFilterOption = {
      filterIcon: <Icon type="search" className={cls} />,
      filterDropdown: (
        <Input.Search
          ref={ele => {
            this[`searchInput_${key}`] = ele;
          }}
          placeholder="搜索"
          onSearch={this.handleSearch(key)}
          style={{ width: 180 }}
          enterButton
        />
      ),
      filterDropdownVisible: filterDropdownVisible === key,
      onFilterDropdownVisibleChange: visible => {
        if (visible) {
          this[`searchInput_${key}`].input.input.value = filters[key] || '';
        }
        this.setState(
          {
            filterDropdownVisible: visible ? key : false,
          },
          () => this[`searchInput_${key}`] && this[`searchInput_${key}`].focus()
        );
      },
    };
    if (!serverSide && !column.onFilter) {
      searchFilterOption.onFilter = this.makeDefaultOnSearch(key);
    }
    return searchFilterOption;
  };

  makeFilterOption = (key, column) => {
    const { filterDropdownVisible } = this.state;
    const { serverSide } = this.props;
    const filterOption = {
      filterDropdown: (
        <Filter filters={column.filters} handleConfirm={this.handleTreeFilter(key)} />
      ),
      filterDropdownVisible: filterDropdownVisible === key,
      onFilterDropdownVisibleChange: visible => {
        this.setState({
          filterDropdownVisible: visible ? key : false,
        });
      },
    };
    if (!serverSide && !column.onFilter) {
      filterOption.onFilter = this.makeDefaultOnFilter(key);
    }
    return filterOption;
  };

  makeTreeFilterOption = (key, column) => {
    const { filterDropdownVisible } = this.state;
    const { serverSide } = this.props;
    const treeFilterOption = {
      filterDropdown: (
        <TreeFilter treeFilters={column.treeFilters} handleConfirm={this.handleTreeFilter(key)} />
      ),
      filterDropdownVisible: filterDropdownVisible === key,
      onFilterDropdownVisibleChange: visible => {
        this.setState({
          filterDropdownVisible: visible ? key : false,
        });
      },
    };
    if (!serverSide && !column.onFilter) {
      treeFilterOption.onFilter = this.makeDefaultOnFilter(key);
    }
    return treeFilterOption;
  };

  makeDateFilterOption = (key, column) => {
    const { filterDropdownVisible, filtered } = this.state;
    const { serverSide } = this.props;
    const cls = classNames({
      [styles['table-filter-active']]: filtered.indexOf(key) !== -1,
    });
    const dateFilterOption = {
      filterIcon: <Icon type="clock-circle-o" className={cls} />,
      filterDropdown: (
        <DateFilter
          onSearchTime={this.handleDateFilter(key)}
          dateFilterVisible={filterDropdownVisible === key}
        />
      ),
      filterDropdownVisible: filterDropdownVisible === key,
      onFilterDropdownVisibleChange: visible => {
        this.setState({
          filterDropdownVisible: visible ? key : false,
        });
      },
    };
    if (!serverSide && !column.onFilter) {
      dateFilterOption.onFilter = this.makeDefaultDateFilter(key);
    }

    return dateFilterOption;
  };

  makeRangeFilterOption = (key, column) => {
    const { filterDropdownVisible, filters, filtered } = this.state;
    const { serverSide } = this.props;
    const cls = classNames({
      [styles['table-filter-active']]: filtered.indexOf(key) !== -1,
    });
    const rangeFilterOption = {
      filterIcon: <Icon type="filter" className={cls} />,
      filterDropdown: (
        <RangeFilter
          ref={ele => {
            this[`rangeInput_${key}`] = ele;
          }}
          onSearchRange={this.handleRangeFilter(key)}
        />
      ),
      filterDropdownVisible: filterDropdownVisible === key,
      onFilterDropdownVisibleChange: visible => {
        if (visible) {
          this[`rangeInput_${key}`].onChange(
            filters[key] ? filters[key][0] : { min: null, max: null }
          );
        }
        this.setState({
          filterDropdownVisible: visible ? key : false,
        });
      },
    };
    if (!serverSide && !column.onFilter) {
      rangeFilterOption.onFilter = this.makeDefaultOnRangeFilter(key);
    }
    return rangeFilterOption;
  };

  makerFiltersText = (key, value) => {
    if (!this.columnsText[key]) return {};
    if (value === '' || value === undefined) return { [key]: null };
    if (isArray(value) && !value.length) return { [key]: null };
    const { title, filters, treeFilters, dateFilters, rangeFilters } = this.columnsText[key];
    const filtersText = {};
    if (value.length === 0 || !value) return filtersText;
    if (filters) {
      const newValue = value.join(',').split(',');
      filtersText[key] = { title };
      filtersText[key].text = filters
        .filter(item => newValue.indexOf(`${item.value}`) !== -1)
        .map(item => item.text)
        .join('，');
    } else if (treeFilters) {
      const { data } = treeFilters;
      const text = treeFilters.title;
      const dataIndex = treeFilters.value;
      filtersText[key] = { title };
      const newValue = value.join(',').split(',');
      filtersText[key].text = data
        .filter(item => newValue.indexOf(`${item[dataIndex]}`) !== -1)
        .map(item => item[text])
        .join('，');
    } else if (dateFilters || rangeFilters) {
      filtersText[key] = { title };
      filtersText[key].text = `${value[0].min} ~ ${value[0].max}`;
    } else {
      filtersText[key] = { title };
      filtersText[key].text = value;
    }
    return `${filtersText[key].text}` ? filtersText : {};
  };

  handleSearch = key => value => {
    const { pagination, filters, sorter, filtered } = this.state;
    const searchFilter = value ? [value] : [];
    const filteredState = filtered.filter(item => item !== key);
    const filtersText = {
      ...this.state.filtersText,
      ...this.makerFiltersText(key, value),
    };
    if (value) {
      filteredState.push(key);
    } else {
      delete filtersText[key];
    }

    const newFilters = {
      ...filters,
      [key]: searchFilter,
    };

    this.setState(
      {
        filtersText,
        filtered: filteredState,
        filterDropdownVisible: false,
      },
      () => {
        this.handleTableChange(pagination, newFilters, sorter);
      }
    );
  };

  handleTreeFilter = key => checkedKeys => {
    const { pagination, filters, sorter } = this.state;
    const newFilters = {
      ...filters,
      [key]: checkedKeys,
    };
    const filtersText = {
      ...this.state.filtersText,
      ...this.makerFiltersText(key, checkedKeys),
    };
    if (!checkedKeys.length) delete filtersText[key];
    this.setState(
      {
        filtersText,
        filterDropdownVisible: false,
      },
      () => {
        this.handleTableChange(pagination, newFilters, sorter);
      }
    );
  };

  handleDateFilter = key => timeValue => {
    const { pagination, filters, sorter, filtered } = this.state;
    const filteredState = filtered.filter(item => item !== key);

    const filtersText = {
      ...this.state.filtersText,
      ...this.makerFiltersText(key, timeValue),
    };

    const newFilters = {
      ...filters,
      [key]: timeValue,
    };

    if (timeValue.length > 0) {
      filteredState.push(key);
    } else {
      delete newFilters[key];
      delete filtersText[key];
    }

    this.setState(
      {
        filtersText,
        filtered: filteredState,
        filterDropdownVisible: false,
      },
      () => {
        this.handleTableChange(pagination, newFilters, sorter);
      }
    );
  };

  handleRangeFilter = key => rangeValue => {
    const { pagination, filters, sorter, filtered } = this.state;
    const filteredState = filtered.filter(item => item !== key);
    const newFilters = { ...filters };
    const { min, max } = rangeValue[0];
    const filtersText = {
      ...this.state.filtersText,
      ...this.makerFiltersText(key, rangeValue),
    };
    if (min || max) {
      filteredState.push(key);
      newFilters[key] = rangeValue;
    } else {
      delete newFilters[key];
      delete filtersText[key];
    }

    this.setState(
      {
        filtersText,
        filtered: filteredState,
        filterDropdownVisible: false,
      },
      () => {
        this.handleTableChange(pagination, newFilters, sorter);
      }
    );
  };

  handleMoreFilter = (value, valueText) => {
    const { filters, sorter, pagination, filtersText } = this.state;
    const newFilters = {};
    const newFilterText = {};
    assign(newFilters, filters, value);
    assign(newFilterText, filtersText, valueText);
    forIn(newFilterText, (filter, key) => {
      if (
        (filter.text !== 0 && !filter.text) ||
        ((newFilters[key] !== 0 || newFilters[key].length === 0) && !newFilters[key])
      ) {
        delete newFilterText[key];
        delete newFilters[key];
      }
      if (!filter.title && this.columnsText[key]) {
        newFilterText[key].title = this.columnsText[key].title;
      }
    });

    this.setState(
      { filtersText: newFilterText },
      this.handleTableChange(pagination, newFilters, sorter)
    );
  };

  handleTableChange = (pagination, newFilters, sorter) => {
    const { onChange } = this.props;
    const { filters } = this.state;
    const newPagination = { ...pagination };
    if (JSON.stringify(newFilters) !== JSON.stringify(filters)) {
      newPagination.current = 1;
    }
    if (onChange) {
      onChange(newPagination, newFilters, sorter, this.changeStateAndFetch);
    } else {
      this.changeStateAndFetch(newPagination, newFilters, sorter);
    }
  };

  changeStateAndFetch = (pagination, filters, sorter) => {
    this.setState(
      {
        filters,
        pagination,
        sorter,
      },
      () => {
        if (this.props.serverSide) {
          this.fetchTableDataSource();
        }
      }
    );
  };

  makeDefaultOnFilter = key => value => {
    const { serverSide } = this.props;
    if (serverSide) return true;
    const valueInfo = eval(`arguments[1].${key}`);
    if (Array.isArray(valueInfo)) {
      const able = valueInfo.find(item => item.toString() === value);
      return able;
    }
    return `${valueInfo}` === `${value}`;
  };

  makeDefaultOnRangeFilter = key => ({ min, max }) => {
    const valueInfo = parseFloat(eval(`arguments[1].${key}`));
    return (!min || parseFloat(min) <= valueInfo) && (!max || parseFloat(max) >= valueInfo);
  };

  makeDefaultDateFilter = key => ({ min, max }) => {
    const valueInfo = moment(eval(`arguments[1].${key}`));
    return (!min || moment(min) <= valueInfo) && (!max || moment(max) >= valueInfo);
  };

  makeDefaultOnSearch = key => value => {
    const valueInfo = eval(`arguments[1].${key}`);
    return `${valueInfo}`.match(new RegExp(value, 'gi'));
  };

  makeDefaultSorter = key => () => {
    let a = eval(`arguments[0].${key}`);
    let b = eval(`arguments[1].${key}`);

    if (moment(a).isValid() && moment(b).isValid()) {
      a = moment(a).valueOf();
      b = moment(b).valueOf();
    }
    return (parseFloat(a) || 0) - (parseFloat(b) || 0);
  };

  makeDefaultSearchRender = key => {
    const { filters } = this.state;
    return val => {
      if (filters[key]) {
        const reg = new RegExp(filters[key][0], 'gi');
        const match = `${val}`.match(reg);
        return (
          <span>
            {`${val}`.split(reg).map(
              (text, i) =>
                i > 0
                  ? [
                      <span key={key} className="ant-table-search-highlight">
                        {match[0]}
                      </span>,
                      text,
                    ]
                  : text
            )}
          </span>
        );
      }
      return val;
    };
  };

  resetFilter = key => {
    const { pagination, filters, sorter, filtered, filtersText } = this.state;
    let newFilters = { ...filters };
    let newFiltersText = { ...filtersText };
    if (filters[key] !== undefined) {
      const deleteValue = filtersText[key];
      if (deleteValue.same) {
        const sameValue = deleteValue.same;
        const sameKey = deleteValue.number;
        forIn(filtersText, (filter, deleteKey) => {
          if (sameValue === filter.same && sameKey < filter.number) {
            newFilters = omit(newFilters, [deleteKey]);
            newFiltersText = omit(newFiltersText, [deleteKey]);
          }
        });
      }
      newFilters = omit(newFilters, [key]);
      newFiltersText = omit(newFiltersText, [key]);
    } else {
      newFilters = {};
      newFiltersText = {};
    }
    let newFiltered = [];
    if (key) newFiltered = filtered.filter(item => item !== key);
    this.setState(
      {
        filters: newFilters,
        filtered: newFiltered,
        filtersText: newFiltersText,
      },
      () => {
        this.handleTableChange(pagination, newFilters, sorter);
      }
    );
  };

  handleRowSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({ selectedRowKeys, selectedRows }, () => {
      const { rowSelection } = this.props;
      const { midSelectedRows } = this.state;
      const midArray = [];
      for (let i = 0; i < midSelectedRows.length; i += 1) {
        midArray.push(midSelectedRows[i]);
      }
      for (let i = 0; i < selectedRows.length; i += 1) {
        let flag = true;
        for (let j = 0; j < midSelectedRows.length; j += 1) {
          if (selectedRows[i] === midSelectedRows[j]) {
            flag = false;
            break;
          }
        }
        if (flag) {
          midArray.push(selectedRows[i]);
        }
      }
      this.state.midSelectedRows = midArray;
      this.setState({
        selectedRowsReal: selectedRowKeys.map(item => {
          const [mid] = midArray.filter(midkey => midkey.id === item);
          return mid;
        }),
      });
      if (rowSelection && rowSelection.onChange) {
        rowSelection.onChange(selectedRowKeys, this.state.selectedRowsReal);
      }
    });
  };

  makeTableProps = () => {
    const { pagination, selectedRowKeys } = this.state;
    const {
      data,
      total,
      scroll,
      serverSide,
      rowSelection,
      extraColumns,
      multiOperator,
    } = this.props;

    if (serverSide) {
      pagination.total = total;
    }
    const newRowSelection =
      multiOperator && multiOperator.length > 0
        ? {
            ...rowSelection,
            selectedRowKeys,
            onChange: this.handleRowSelectChange,
          }
        : rowSelection;
    let columns = this.mapColumns();
    if (serverSide) columns = columns.filter(item => !item.hidden);
    const newScroll = { ...scroll };
    if (extraColumns) {
      columns = this.makeInitColumns(columns);
      let x = 200;
      columns.forEach(item => {
        if (item.width) {
          x += item.width;
        }
      });
      newScroll.x = x;
    }
    const rowKey = (record, index) => record.id || record.staff_sn || record.shop_sn || index;
    const response = {
      rowKey,
      pagination,
      size: 'middle',
      bordered: true,
      dataSource: data,
      ...this.props,
      columns,
      scroll: newScroll,
      rowSelection: newRowSelection,
      onChange: (paginationChange, filters, sorter) => {
        const newFilters = { ...this.state.filters };
        forIn(filters, (value, key) => {
          if (value !== null) {
            newFilters[key] = filters[key];
          }
        });
        this.handleTableChange(paginationChange, newFilters, sorter);
      },
    };
    if (this.props.pagination && typeof this.props.pagination === 'object') {
      response.pagination = {
        ...pagination,
        ...this.props.pagination,
      };
    }

    Object.keys(defaultProps).forEach(key => {
      delete response[key];
    });
    return response;
  };

  makeExcelFieldsData = data => {
    const {
      extraExportFields,
      excelExport: { fileName },
    } = this.props;
    const { columns } = this.state;
    let exportFields = extraExportFields.concat(columns);
    exportFields = exportFields.filter(item => item.dataIndex !== undefined);
    const newData = [];
    data.forEach(item => {
      let temp = {};

      Object.keys(exportFields).forEach(column => {
        const columnValue = exportFields[column];
        if (item[columnValue.dataIndex] === undefined) return;
        if (columnValue.exportRender) {
          temp[columnValue.dataIndex] = columnValue.exportRender(item);
        } else if (columnValue.render) {
          const renderValue = columnValue.render(item[columnValue.dataIndex], item);
          if (typeof renderValue === 'string') {
            temp[columnValue.dataIndex] = renderValue;
          } else if (React.isValidElement(renderValue)) {
            temp[columnValue.dataIndex] = renderValue.props.children;
          } else {
            temp[columnValue.dataIndex] = item[columnValue.dataIndex] || '';
          }
        } else if (!columnValue.render) {
          temp[columnValue.dataIndex] = item[columnValue.dataIndex] || '';
        }
      });
      temp = Object.values(temp);
      newData.push(temp);
    });
    const header = Object.keys(exportFields).map(key => exportFields[key].title);
    const sheetHeader = [];
    header.forEach(item => {
      if (sheetHeader.indexOf(item) === -1) {
        sheetHeader.push(item);
      }
    });
    const datas = {
      sheetHeader,
      sheetData: newData,
    };
    const workbook = XLSX.utils.book_new();
    const dataExcel = [...datas.sheetData];
    dataExcel.unshift(datas.sheetHeader);
    const errorSheet = XLSX.utils.aoa_to_sheet(dataExcel);
    XLSX.utils.book_append_sheet(workbook, errorSheet);
    XLSX.writeFile(workbook, fileName || '导出数据信息.xlsx');
  };

  xlsExportExcel = ({ headers, data }) => {
    const {
      excelExport: { fileName },
    } = this.props;
    const workbook = XLSX.utils.book_new();
    const dataExcel = [...data];
    dataExcel.unshift(headers);
    const errorSheet = XLSX.utils.aoa_to_sheet(dataExcel);
    XLSX.utils.book_append_sheet(workbook, errorSheet);
    XLSX.writeFile(workbook, fileName || '导出数据信息.xlsx');
  };

  handleExportExcel = () => {
    const {
      excelExport: { actionType },
      dispatch,
      fileExportChange,
    } = this.props;
    const params = this.fetchTableDataSource(true);
    delete params.page;
    delete params.pagesize;
    dispatch({
      type: actionType,
      payload: params,
      onError: errors => {
        if (fileExportChange.onError) {
          fileExportChange.onError(errors);
          return;
        }
        message.error('导出失败!!');
      },
      onSuccess: fileExportChange.onSuccess || this.makeExcelFieldsData,
    });
  };

  handleExcelTemplate = () => {
    const { excelTemplate } = this.props;
    location.href = excelTemplate;
  };

  handleVisibleColumnsChange = columnsMenuValue => {
    const { columns } = this.state;
    const propsColumns = {};
    this.props.columns.forEach(item => {
      if (item.dataIndex) propsColumns[item.dataIndex] = item;
    });
    const newColumns = columns.map(item => {
      if (!item.dataIndex) return item;
      const temp = propsColumns[item.dataIndex];
      if (!item.dataIndex || columnsMenuValue.indexOf(item.dataIndex) !== -1) {
        delete temp.hidden;
      } else {
        temp.hidden = true;
        delete temp.fixed;
      }
      return temp;
    });
    this.setState({ columnsMenuValue, columns: newColumns });
  };

  makeInitColumns = columns => {
    let widthAble = false;
    let fixed = true;
    const newColumns = columns.map(item => {
      if (!item.width) widthAble = true;
      if (!item.fixed) fixed = false;
      return item;
    });
    if (!widthAble) {
      let widthIndex = 0;
      newColumns.forEach((item, index) => {
        if (item.width && (!item.fixed || fixed) && !item.hidden && item.dataIndex) {
          widthIndex = index;
        }
      });
      delete newColumns[widthIndex].width;
    }
    return newColumns;
  };

  columnsCheckAll = checked => {
    this.handleVisibleColumnsChange(checked ? this.columnsDataIndex : this.lockColumnsDataIndex);
  };

  makeVisibleColumnsList = () => {
    const { columns, columnsMenuValue } = this.state;
    const columnsData = columns.filter(item => item.dataIndex);
    return (
      <div className={styles.columnsMenu}>
        <div>
          全选：
          <Switch
            size="small"
            onChange={this.columnsCheckAll}
            defaultChecked={columnsMenuValue.length === this.columnsDataIndex.length}
          />
        </div>
        <div style={{ marginTop: 10 }}>
          <Checkbox.Group value={columnsMenuValue} onChange={this.handleVisibleColumnsChange}>
            {columnsData.map(item => (
              <Row key={item.dataIndex}>
                <Col>
                  <Checkbox disabled={item.fixed !== undefined} value={item.dataIndex}>
                    {item.title}
                  </Checkbox>
                </Col>
              </Row>
            ))}
          </Checkbox.Group>
        </div>
      </div>
    );
  };

  makeExtraOperator = () => {
    const {
      excelInto,
      excelExport,
      extraColumns,
      extraOperator,
      excelTemplate,
      fileExportChange,
    } = this.props;
    let operator = [];
    if (isArray(extraOperator)) {
      operator = [...extraOperator];
    } else if (extraOperator) {
      operator = [React.cloneElement(extraOperator, { key: 'firstOne' })];
    }
    if (excelInto) {
      operator.push(
        <Tooltip key="upload" title="导入数据">
          <TableUpload
            uri={excelInto}
            {...fileExportChange}
            onSuccess={response => {
              this.fetchTableDataSource(null, true);
              if (fileExportChange.onSuccess) fileExportChange.onSuccess(response);
            }}
          >
            EXCEL导入
          </TableUpload>
        </Tooltip>
      );
    }

    if (excelExport) {
      operator.push(
        <Tooltip key="download" title="导出数据">
          <Button icon="download" onClick={this.handleExportExcel}>
            EXCEL导出
          </Button>
        </Tooltip>
      );
    }

    if (excelTemplate) {
      operator.push(
        <Tooltip key="muban" title="模板">
          <Button icon="download" onClick={this.handleExcelTemplate}>
            下载EXCEL模板
          </Button>
        </Tooltip>
      );
    }

    if (extraColumns) {
      operator.push(
        <Popover
          key="eye"
          trigger="click"
          placement="bottom"
          content={this.makeVisibleColumnsList()}
          onVisibleChange={eyeVisible => {
            this.setState({ eyeVisible });
          }}
        >
          <Button icon="eye">可见信息</Button>
        </Popover>
      );
    }

    return operator;
  };

  render() {
    const {
      sync,
      moreSearch,
      autoComplete,
      tableVisible,
      multiOperator,
      operatorVisble,
      extraOperatorRight,
    } = this.props;

    const { filters, filtersText, selectedRows, filterDropdownVisible, eyeVisible } = this.state;
    const tableProps = this.makeTableProps();
    let searchObj = {};
    if (isBoolean(moreSearch) && moreSearch) {
      searchObj = this.state.columns.filter(item => item.hidden && item.dataIndex);
    } else if (autoComplete) {
      searchObj = {
        content: moreSearch,
        columns: this.state.columns.filter(item => item.hidden && item.dataIndex),
      };
    } else {
      searchObj = moreSearch;
    }
    const newFiltersText = {};
    forIn(filtersText, (value, key) => {
      if (value) newFiltersText[key] = value;
    });
    return (
      <div className={styles.filterTable}>
        {operatorVisble && (
          <Operator
            sync={sync}
            filters={filters}
            moreSearch={searchObj}
            selectedRowsReal={this.state.selectedRowsReal}
            selectedRows={selectedRows}
            filtersText={newFiltersText}
            multiOperator={multiOperator}
            resetFilter={this.resetFilter}
            onChange={this.handleMoreFilter}
            extraOperatorRight={extraOperatorRight}
            extraOperator={this.makeExtraOperator()}
            fetchTableDataSource={() => {
              this.fetchTableDataSource(null, true);
            }}
            filterDropdownVisible={filterDropdownVisible || eyeVisible}
          />
        )}
        {tableVisible === true && <Table {...tableProps} className={styles.filterTableContent} />}
      </div>
    );
  }
}

OATable.EdiTableCell = EdiTableCell;
OATable.defaultProps = defaultProps;
OATable.renderEllipsis = renderEllipsis;
OATable.analysisColumn = analysisColumn;
OATable.findRenderKey = findRenderKey;

export default OATable;
