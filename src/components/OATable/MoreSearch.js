/*eslint-disable */
import React from 'react';
import moment from 'moment';
import { Input, Button, Popover, Form, Select, Row, Col, DatePicker, TreeSelect } from 'antd';
import { mapValues, isArray, isObject, isString, map, assign } from 'lodash';
import InputRange from '../InputRange';
import { markTreeData } from '../../utils/utils';

const { RangePicker } = DatePicker;

const FormItem = Form.Item;
const { Option } = Select;

export const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

export default class MoreSearch extends React.Component {
  state = {
    filters: {},
    visible: false,
    colCountKey: 1,
    filtersText: {},
  };

  componentWillMount() {
    this.colCounts = {};
    [1, 2, 3].forEach((value, i) => {
      this.colCounts[i] = `${value}列`;
    });
  }

  componentWillReceiveProps(nextProps) {
    const { filterDropdownVisible } = nextProps;
    if ('filterDropdownVisible' in nextProps && filterDropdownVisible) {
      this.setState({ visible: false });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      JSON.stringify(nextState) !== JSON.stringify(this.state) ||
      JSON.stringify(nextProps.filters) !== JSON.stringify(this.props.filters) ||
      JSON.stringify(nextProps.filterDropdownVisible) !==
        JSON.stringify(this.props.filterDropdownVisible)
    ) {
      return true;
    }
    return false;
  }

  onChange = () => {
    const { onChange } = this.props;
    const { filters, filtersText } = this.state;
    this.setState({ visible: false }, onChange(filters, filtersText));
  };

  onColCountChange = colCountKey => {
    this.setState({ colCountKey });
  };

  handleVisible = () => {
    const { visible, filters, filtersText } = this.state;
    const state = { visible: !visible };
    if (state.visible === true && JSON.stringify(filters) !== JSON.stringify(this.props.filters)) {
      state.filters = { ...this.props.filters };
    }
    if (
      state.visible === true &&
      JSON.stringify(filtersText) !== JSON.stringify(this.props.filtersText)
    ) {
      state.filtersText = { ...this.props.filtersText };
    }
    this.setState(state);
  };

  handleSearchChange = (key, filterTextValue) => e => {
    const value = e.target ? e.target.value : e;
    const { filters } = this.state;
    const { filtersText } = this.state;
    const newFiltersText = { ...filtersText };
    if (key) {
      newFiltersText[key] = filterTextValue || { title: null, text: value };
    } else {
      assign(newFiltersText, filtersText, filterTextValue);
    }
    let keyValue = value;
    if (isArray(value)) {
      keyValue = value;
    } else if (isObject(value) || isString(value)) {
      keyValue = [value];
    }
    this.setState({
      filters: {
        ...filters,
        ...(!key ? e : { [key]: keyValue }),
      },
      filtersText: newFiltersText,
    });
  };

  resetSearch = () => {
    const { filters } = this.state;
    const newFilters = mapValues(filters, () => undefined);
    this.setState({ filters: newFilters }, this.onChange);
  };

  makeFormItemProps = props => ({
    ...formItemLayout,
    label: props.title,
    key: props.dataIndex,
  });

  makeSearchProps = props => {
    const { filters } = this.state;
    return {
      style: { width: '100%' },
      value: filters[props.dataIndex],
      placeholder: `请输入${props.title}`,
      onChange: this.handleSearchChange(props.dataIndex),
    };
  };

  makeSearcherFilter = item => (
    <FormItem {...this.makeFormItemProps(item)}>
      <Input {...this.makeSearchProps(item)} />
    </FormItem>
  );

  makeDefaultFilters = item => {
    const selectProps = this.makeSearchProps(item);
    const { filters, title, dataIndex } = item;
    selectProps.onChange = value => {
      const filterTextValue = filters
        .filter(i => value.indexOf(`${i.value}`) !== -1)
        .map(i => i.text)
        .join(',');
      this.handleSearchChange(dataIndex, {
        title,
        text: filterTextValue,
      })(value);
    };
    selectProps.value = (selectProps.value || []).map(k => `${k}`);
    return (
      <FormItem {...this.makeFormItemProps(item)}>
        <Select {...selectProps} mode="multiple">
          {map(filters, filter => (
            <Option key={`${filter.value}`}>{filter.text}</Option>
          ))}
        </Select>
      </FormItem>
    );
  };

  makeTreeFilters = item => {
    const selectProps = this.makeSearchProps(item);
    const {
      treeFilters,
      treeFilters: { data },
      title,
      dataIndex,
    } = item;
    selectProps.onChange = value => {
      const filterTextValue = data
        .filter(i => value.indexOf(`${i[treeFilters.value]}`) !== -1)
        .map(i => i[treeFilters.title])
        .join('，');
      this.handleSearchChange(dataIndex, {
        title,
        text: filterTextValue,
      })(value);
    };
    selectProps.treeData = markTreeData(
      data,
      {
        value: treeFilters.value,
        label: treeFilters.title,
        parentId: treeFilters.parentId,
      },
      treeFilters.initParent || 0
    );
    selectProps.value = (selectProps.value || []).map(k => `${k}`);
    return (
      <FormItem {...this.makeFormItemProps(item)}>
        <TreeSelect
          multiple
          allowClear
          treeCheckable
          {...selectProps}
          dropdownMatchSelectWidth
          getPopupContainer={triggerNode => triggerNode}
          dropdownStyle={{ width: '100%', maxHeight: '200px' }}
        />
      </FormItem>
    );
  };

  makeRangeFilter = item => {
    const selectProps = this.makeSearchProps(item);
    const { title, dataIndex } = item;
    selectProps.onChange = range => {
      const value = { ...range };
      this.handleSearchChange(dataIndex, { title, text: `${value.min} ~ ${value.max}` })(value);
    };
    [selectProps.value] = selectProps.value || [{}];
    const { min, max } = selectProps.value;
    selectProps.value = [min, max];
    return (
      <FormItem {...this.makeFormItemProps(item)}>
        <InputRange {...selectProps} />
      </FormItem>
    );
  };

  makeDateFilter = item => {
    const selectProps = this.makeSearchProps(item);
    const { title, dataIndex } = item;
    selectProps.onChange = (_, dateStrings) => {
      const value = {
        min: dateStrings[0],
        max: dateStrings[1],
      };
      this.handleSearchChange(dataIndex, { title, text: `${value.min} ~ ${value.max}` })(value);
    };
    const dateFormat = 'YYYY-MM-DD';
    [selectProps.value] = selectProps.value || [{}];
    const min = selectProps.value.min ? moment(selectProps.value.min, dateFormat) : undefined;
    const max = selectProps.value.max ? moment(selectProps.value.max, dateFormat) : undefined;
    selectProps.value = [min, max];
    selectProps.placeholder = ['开始时间', '结束时间'];
    return (
      <FormItem {...this.makeFormItemProps(item)}>
        <RangePicker {...selectProps} format={dateFormat} />
      </FormItem>
    );
  };

  makeColumnsSearch = moreSearch =>
    moreSearch
      .map(item => {
        if (item.searcher) {
          return this.makeSearcherFilter(item);
        }
        if (item.filters) {
          return this.makeDefaultFilters(item);
        }
        if (item.treeFilters) {
          return this.makeTreeFilters(item);
        }
        if (item.rangeFilters) {
          return this.makeRangeFilter(item);
        }
        if (item.dateFilters) {
          return this.makeDateFilter(item);
        }
        return null;
      })
      .filter(item => item);

  renderColumns = moreSearch => {
    if (moreSearch.length) {
      return this.makeColumnsSearch(moreSearch);
    }
    return null;
  };

  renderMoreSearch = moreSearch => {
    const { filters } = this.state;
    return React.cloneElement(moreSearch, {
      initialValue: filters,
      onChange: this.handleSearchChange,
    });
  };

  renderMoreSearchContent = content => {
    if (isArray(content)) {
      return this.makeColumnsSearch(content);
    }
    if (React.isValidElement(content)) {
      return this.renderMoreSearch(content);
    }
    return null;
  };

  renderContent = () => {
    const { moreSearch } = this.props;
    const { colCountKey } = this.state;
    const colCount = this.colCounts[colCountKey].replace('列', '');
    const span = 24 / colCount;
    /* const sliderCom = (
      <div style={{ width: '100%', padding: '0 20px' }}>
        <Slider
          min={0}
          step={null}
          value={colCountKey}
          marks={this.colCounts}
          onChange={this.onColCountChange}
          max={Object.keys(this.colCounts).length - 1}
        />
      </div>
    ); */
    return (
      <React.Fragment>
        <div
          style={{
            maxHeight: 300,
            overflowY: 'auto',
            overflowX: 'hidden',
            maxWidth: colCountKey === 2 ? 800 : 600,
          }}
        >
          <Row>
            {isArray(moreSearch) && (
              <React.Fragment>
                {this.renderColumns(moreSearch).map((item, index) => {
                  const key = index;
                  return (
                    <Col key={key} span={span}>
                      {item}
                    </Col>
                  );
                })}
              </React.Fragment>
            )}
            {React.isValidElement(moreSearch) && this.renderMoreSearch(moreSearch)}
            {isObject(moreSearch) && (
              <React.Fragment>
                <div style={{ width: '100%' }}>
                  {moreSearch.content && isArray(moreSearch.content)
                    ? this.renderMoreSearchContent(moreSearch.content).map((item, index) => {
                        const key = index;
                        return (
                          <Col key={key} span={span}>
                            {item}
                          </Col>
                        );
                      })
                    : this.renderMoreSearchContent(moreSearch.content)}
                </div>
                <div style={{ width: '100%' }}>
                  {moreSearch.columns &&
                    moreSearch.columns.length > 0 &&
                    this.renderColumns(moreSearch.columns).map((item, index) => {
                      const key = index;
                      return (
                        <Col key={key} span={span}>
                          {item}
                        </Col>
                      );
                    })}
                </div>
              </React.Fragment>
            )}
          </Row>
        </div>
        <div className="ant-table-filter-dropdown-btns">
          <a className="ant-table-filter-dropdown-link clear" onClick={this.resetSearch}>
            重置
          </a>
          <a className="ant-table-filter-dropdown-link confirm" onClick={this.onChange}>
            确定
          </a>
        </div>
      </React.Fragment>
    );
  };

  render() {
    const { visible } = this.state;
    return (
      <Popover trigger="click" visible={visible} placement="bottom" content={this.renderContent()}>
        <Button icon="filter" onClick={this.handleVisible}>
          更多筛选
        </Button>
      </Popover>
    );
  }
}
MoreSearch.defaultProps = {
  filters: {},
  onChange: () => {},
};
