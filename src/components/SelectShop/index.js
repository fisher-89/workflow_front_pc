import React, { Component } from 'react';
import { Tag } from 'antd';
import { connect } from 'dva';
import request from '../../utils/request';
import { makeFieldValue, judgeIsNothing } from '../../utils/utils';

import ShopModal from './ShopModal';
import style from './index.less';

@connect(({ loading, staff }) => ({
  loading,
  staff,
}))
class SelectShop extends Component {
  constructor(props) {
    super(props);
    const { value, multiple, defaultValue, name } = this.props;
    if (judgeIsNothing(defaultValue)) {
      const sNo = multiple
        ? defaultValue.map(item => item[name.shop_sn])
        : defaultValue[name.shop_sn];
      request('/api/oa/shops', {
        method: 'GET',
        body: { filters: `shop_sn=[${sNo}]` },
      }).then(res => {
        this.setState({
          source: res,
          value: res.length
            ? makeFieldValue(
                multiple ? res : res[0],
                { shop_sn: 'value', name: 'text' },
                multiple,
                false
              )
            : '',
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
    // this.setState({
    //   visible: false
    // })
  };

  onDelete = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    const { value, source } = this.state;
    const { name } = this.props;
    const newValue = this.multiple ? value.filter(v => v[name.shop_sn] !== item.shop_sn) : '';
    const newSource = this.multiple ? source.filter(v => v.shop_sn !== item.shop_sn) : '';

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
      ? makeFieldValue(value, { shop_sn: name.shop_sn, name: name.name }, this.multiple, false)
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
      type: 'staff/fetchShops',
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
            {source.map(item => (
              <Tag closable key={item.shop_sn} onClose={e => this.onDelete(e, item)}>
                {item.name}
              </Tag>
            ))}
          </div>
        </div>
        <ShopModal
          visible={this.state.visible}
          onChange={this.onMaskChange}
          onCancel={() => this.setState({ visible: false })}
          multiple={multiple}
          fetchUrl="/api/oa/shops"
          range={range}
          checkedShop={source}
          fetchDataSource={this.fetchDataSource}
        />
      </div>
    );
  }
}
SelectShop.defaultProps = {
  name: { name: 'text', shop_sn: 'value' },
  onChange: () => {},
  effect: 'staff/fetchShops',
};
export default SelectShop;
