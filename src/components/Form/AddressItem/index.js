import React, { PureComponent } from 'react';
import { Input, Form, InputNumber } from 'antd';
import { connect } from 'dva';
import FormItem from '../FormItem';
import Address from '../../Address';
import style from './index.less';

@connect()
class AddressItem extends PureComponent {
  state = {};

  onChange = value => {
    // const { form: { setFieldsValue }, feild: { key } } = this.props;
    // setFieldsValue({ address: value })
  };

  render() {
    const {
      form: { getFieldDecorator },
      defaultValue,
      required,
      feild: { key, name },
      feild,
    } = this.props;
    return (
      <FormItem className={style.address} {...feild} width="675px" height="150px">
        {getFieldDecorator(key, {
          initialValue: defaultValue,
          rules: [{ required, message: `请输入${name}` }],
        })(
          <Address
            {...feild}
            name={{
              province_id: 'province',
              city_id: 'city',
              county_id: 'county',
              address: 'addres',
            }}
          />
        )}
      </FormItem>
    );
  }
}

export default AddressItem;
