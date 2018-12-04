import React, { PureComponent } from 'react';
import { connect } from 'dva';
import FormItem from '../FormItem';
import Address from '../../Address';
import style from './index.less';

@connect()
class AddressItem extends PureComponent {
  state = {};

  render() {
    const {
      form: { getFieldDecorator },
      defaultValue,
      required,
      field: { key, name },
      field,
    } = this.props;
    return (
      <FormItem className={style.address} {...field} width="675px" height="150px">
        {getFieldDecorator(key, {
          initialValue: defaultValue,
          rules: [{ required, message: `请输入${name}` }],
        })(
          <Address
            {...field}
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
