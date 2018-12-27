import React, { Component } from 'react';
import { Tag } from 'antd';
import { connect } from 'dva';
import request from '../../utils/request';
import { makeFieldValue, judgeIsNothing } from '../../utils/utils';

import StaffModal from './StaffModal';
import style from './index.less';

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
        });
      });
    } else {
      this.state = {
        value,
        source: [],
        visible: false,
      };
    }
    this.multiple = multiple;
  }

  componentWillReceiveProps(props) {
    const { value } = props;
    if (JSON.stringify(value) !== JSON.stringify(this.props.value)) {
      this.setState({
        value,
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

  render() {
    const { selfStyle, multiple, range } = this.props;

    if (!this.state) {
      return null;
    }
    const { source } = this.state;

    return (
      <div className={style.tag_container} onClick={e => e.stopPropagation()}>
        <div className={style.result} style={{ ...selfStyle }} onClick={this.handleClick}>
          <div className={style.tagItem}>
            {(source || []).map(item => (
              <Tag closable key={item.staff_sn} onClose={e => this.onDelete(e, item)}>
                {item.realname}
              </Tag>
            ))}
          </div>
        </div>
        <StaffModal
          visible={this.state.visible}
          onChange={this.onMaskChange}
          onCancel={() => this.setState({ visible: false })}
          multiple={multiple}
          fetchUrl="/api/oa/staff"
          range={range}
          checkedStaff={source}
          fetchDataSource={this.fetchDataSource}
        />
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
