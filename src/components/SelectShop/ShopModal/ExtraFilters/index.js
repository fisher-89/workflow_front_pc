import React, { Component } from 'react';
import { Popover } from 'antd';
import MutiTreeSelect from '../MutiTreeSelect';

import style from './index.less';

class ExtraFilters extends Component {
  constructor(props) {
    super(props);
    const { filters } = this.props;

    this.state = {
      filters,
    };
  }

  componentWillReceiveProps(props) {
    const { filters } = props;
    if (JSON.stringify(filters) !== JSON.stringify(this.props.filters)) {
      this.setState({ filters });
    }
  }

  shouldComponentUpdate(nextProps) {
    return JSON.stringify(nextProps.filters) !== JSON.stringify(this.props.filters);
  }

  filterChange = value => {
    const { onChange, filterDataSource } = this.props;
    const filters = {};
    filterDataSource.forEach(item => {
      const { key } = item;
      const values = value
        .filter(v => v.indexOf(`${key}-`) === 0)
        .map(id => id.slice(key.length + 1));

      filters[key] = values;
    });
    this.setState(
      {
        filters,
      },
      () => {
        onChange(this.state.filters);
      }
    );
  };

  resetFilter = () => {
    const { onChange, filterDataSource } = this.props;
    const filters = {};
    filterDataSource.forEach(item => {
      filters[item.key] = [];
    });
    this.setState(
      {
        filters: { ...filters },
      },
      () => {
        onChange(filters);
      }
    );
  };

  makeSelectedKeys = () => {
    const { filters } = this.state;
    let selectedKeys = [];

    Object.keys(filters).forEach(item => {
      const value = filters[item];
      const newValues = value.map(v => `${item}-${v}`);
      selectedKeys = [...selectedKeys, ...newValues];
    });
    return selectedKeys;
  };

  renderContent = () => {
    const { filterDataSource } = this.props;
    const selectedKeys = this.makeSelectedKeys();
    return (
      <div>
        <div onClick={this.resetFilter} className={style.clear_filter}>
          <span>清空筛选</span>
        </div>
        <div style={{ maxHeight: '320px' }} className={style.filter_content}>
          <MutiTreeSelect
            treeData={filterDataSource}
            onChange={this.filterChange}
            checkedKeys={selectedKeys}
          />
        </div>
      </div>
    );
  };

  render() {
    const { children } = this.props;
    return (
      <Popover placement="bottomRight" trigger="click" content={this.renderContent()}>
        {children}
      </Popover>
    );
  }
}
ExtraFilters.defaultProps = {
  filterDataSource: [],
  filters: {},
};
export default ExtraFilters;
