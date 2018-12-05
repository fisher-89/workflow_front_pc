import React, { PureComponent } from 'react';
import { connect } from 'dva';
import FormItem from '../FormItem';
import Address from '../../Address';
import style from './index.less';

@connect()
class AddressItem extends PureComponent {
  constructor(props) {
    super(props);
    const { defaultValue } = props;
    this.state = {
      value: defaultValue,
      errorMsg: '',
    };
  }

  onChange = value => {
    const {
      field: { name },
    } = this.props;
    let errorMsg = '';
    if (!value || !value.province) {
      errorMsg = `请选择${name}`;
    }
    this.setState(
      {
        value,
        errorMsg,
      },
      () => {
        this.props.onChange(value, errorMsg);
      }
    );
  };

  render() {
    const { field, required } = this.props;
    const { value, errorMsg } = this.state;
    return (
      <FormItem
        className={style.address}
        {...field}
        required={required}
        errorMsg={errorMsg}
        width="675px"
        height="150px"
      >
        <div className={errorMsg ? style.errorMsg : style.noerror}>
          <Address
            {...field}
            value={value}
            onChange={this.onChange}
            name={{
              province_id: 'province',
              city_id: 'city',
              county_id: 'county',
              address: 'addres',
            }}
          />
        </div>
      </FormItem>
    );
  }
}

AddressItem.defaultProps = {
  onChange: () => {},
};
export default AddressItem;
