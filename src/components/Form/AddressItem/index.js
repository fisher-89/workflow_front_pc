import React, { PureComponent } from 'react';
import { connect } from 'dva';
import FormItem from '../FormItem';
import Address from '../../Address';
import { judgeIsNothing } from '../../../utils/utils';
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

  componentWillReceiveProps(props) {
    const { value, errorMsg } = props;
    if (JSON.stringify(value) !== this.props.value || errorMsg !== this.props.errorMsg) {
      this.setState({
        value,
        errorMsg,
      });
    }
  }

  onChange = value => {
    const {
      field: { name },
      required,
    } = this.props;
    let errorMsg = '';
    if (required && (!judgeIsNothing(value) || !value.province)) {
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
    const { field, required, disabled } = this.props;
    const { value, errorMsg } = this.state;
    return (
      <FormItem
        className={style.address}
        {...field}
        required={required}
        errorMsg={errorMsg}
        // width="600"
        height="150"
        extraStyle={{ minWidth: '600px' }}
      >
        <div className={errorMsg ? style.errorMsg : style.noerror}>
          <Address
            {...field}
            value={value}
            disabled={disabled}
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
