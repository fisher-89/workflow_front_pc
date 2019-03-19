import React, { Component } from 'react';
import { Tag, AutoComplete } from 'antd';
import { connect } from 'dva';
import { debounce } from 'lodash';

import request from '../../utils/request';
import { makeFieldValue, judgeIsNothing } from '../../utils/utils';

import StaffModal from './StaffModal';
import style from './index.less';

const { Option } = AutoComplete;
@connect(({ loading, staff }) => ({
  loading,
  staff,
}))
class SelectStaff extends Component {
  constructor(props) {
    super(props);
    const { value, multiple, defaultValue, name } = this.props;
    if (judgeIsNothing(defaultValue)) {
      const sNo = multiple
        ? defaultValue.map(item => item[name.staff_sn])
        : defaultValue[name.staff_sn];
      request('/api/oa/staff', {
        method: 'GET',
        body: { filters: `staff_sn=[${sNo}]` },
      }).then(res => {
        this.setState({
          value: defaultValue,
          source: res,
          visible: false,
          searchResult: [],
          serachValue: defaultValue[name.realname],
        });
      });
    } else {
      this.state = {
        value,
        source: [],
        visible: false,
        searchResult: [],
        serachValue: '',
      };
    }
    this.multiple = multiple;
    this.fetchFiltersDataSource = debounce(params => {
      this.fetchDataSource(params);
    }, 500);
  }

  componentWillReceiveProps(props) {
    const { value } = props;
    if (JSON.stringify(value) !== JSON.stringify(this.props.value)) {
      this.setState({
        value: judgeIsNothing(value) ? value : '',
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      JSON.stringify(this.state) !== JSON.stringify(nextState) ||
      JSON.stringify(nextProps) !== JSON.stringify(this.props)
    );
  }

  onClose = e => {
    e.preventDefault();
    e.stopPropagation();
  };

  onDelete = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    const { value, source } = this.state;
    const { name } = this.props;
    const newValue = this.multiple ? value.filter(v => v[name.staff_sn] !== item.staff_sn) : '';
    const newSource = this.multiple ? source.filter(v => v.staff_sn !== item.staff_sn) : '';

    this.setState(
      {
        value: newValue,
        source: newSource,
      },
      () => {
        this.props.onChange(newValue);
      }
    );
  };

  onSelect = v => {
    const { searchResult } = this.state;
    const { name, onChange } = this.props;
    const result = searchResult.find(item => `${item.staff_sn}` === `${v}`);
    const newValue = makeFieldValue(
      result,
      { staff_sn: name.staff_sn, realname: name.realname },
      false,
      false
    );
    this.setState(
      {
        value: newValue,
        source: [result],
        serachValue: result.realname,
      },
      () => {
        onChange(newValue);
      }
    );
  };

  onMaskChange = (visible, value) => {
    const { name } = this.props;
    const isNothing = !judgeIsNothing(value);
    const newValue = !isNothing
      ? makeFieldValue(
          value,
          { staff_sn: name.staff_sn, realname: name.realname },
          this.multiple,
          false
        )
      : '';
    let source = '';
    if (isNothing) {
      source = [];
    } else {
      source = this.multiple ? value : [value];
    }
    this.setState(
      {
        visible,
        value: newValue,
        source,
        serachValue: !this.multiple ? value.realname : '',
      },
      () => {
        this.props.onChange(newValue);
      }
    );
  };

  handleClick = () => {
    this.setState({
      visible: true,
    });
  };

  fetchDataSource = (params, cb) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'staff/fetchStaffs',
      payload: {
        params: {
          ...params,
        },
        cb: cb || '',
      },
    });
  };

  searchChange = value => {
    this.setState({ serachValue: value });
    request('/api/oa/staff', {
      method: 'GET',
      body: {
        page: 1,
        pagesize: 10,
        filters: value ? `realname~${value}` : '',
      },
    }).then(res => {
      this.setState({
        searchResult: res.data,
      });
    });
  };

  renderSingle = () => {
    const { searchResult, value, serachValue } = this.state;
    const { description, name } = this.props;
    const children = searchResult.length ? (
      searchResult.map(r => (
        <Option key={r.staff_sn} title={`${r.realname}(${r.staff_sn})`}>
          {' '}
          {r.realname} <span style={{ color: '#999' }}> ({r.staff_sn}) </span>
        </Option>
      ))
    ) : (
      <Option key="nothing" disabled>
        无匹配结果{' '}
      </Option>
    );
    return (
      <div className={style.single_result}>
        <span
          className={style.search_icon}
          onClick={!this.props.disabled ? this.handleClick : () => {}}
        />{' '}
        <div className={style.single_search} title={serachValue}>
          <AutoComplete
            onSearch={this.searchChange}
            disabled={this.props.disabled}
            onFocus={() => {
              this.setState({ serachValue: '' });
            }}
            onBlur={() => {
              this.setState({ serachValue: value ? value[name.realname] : '' });
            }}
            placeholder={value ? value[name.realname] : '' || description}
            onSelect={this.onSelect}
            // style={{ border: '1px solid #d9d9d9' }}
            value={serachValue}
            dataSource={searchResult.length ? children : [children]}
          />{' '}
        </div>{' '}
      </div>
    );
  };

  render() {
    const { selfStyle, multiple, range, disabled } = this.props;

    if (!this.state) {
      return null;
    }
    const { source } = this.state;
    return (
      <div className={style.tag_container} onClick={e => e.stopPropagation()}>
        {' '}
        {multiple ? (
          <div
            className={style.result}
            style={{ ...selfStyle }}
            onClick={disabled ? () => {} : this.handleClick}
          >
            <div className={style.tagItem}>
              {' '}
              {(source || []).map(item => (
                <Tag
                  closable={!disabled}
                  key={item.staff_sn}
                  onClose={e => this.onDelete(e, item)}
                  title={item.realname}
                >
                  {item.realname}{' '}
                </Tag>
              ))}{' '}
            </div>{' '}
            {!source.length ? <span className={style.placeholder}> 请选择 </span> : null}{' '}
          </div>
        ) : (
          this.renderSingle()
        )}{' '}
        <StaffModal
          visible={this.state.visible}
          onChange={this.onMaskChange}
          onCancel={() => this.setState({ visible: false })}
          multiple={multiple}
          fetchUrl="/api/oa/staff"
          range={range}
          checkedStaff={source}
          fetchDataSource={this.fetchDataSource}
        />{' '}
      </div>
    );
  }
}
SelectStaff.defaultProps = {
  name: { realname: 'text', staff_sn: 'value' },
  onChange: () => {},
  effect: 'staff/fetchStaffs',
};
export default SelectStaff;
