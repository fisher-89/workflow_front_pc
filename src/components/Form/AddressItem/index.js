import React, { Component } from 'react';
import { connect } from 'dva';
import FormItem from '../FormItem';
import DetailItem from '../DetailItem';
import Address from '../../Address';
import { judgeIsNothing } from '../../../utils/utils';
import style from './index.less';
import districtData from '../../../assets/district';

const { district } = districtData;
@connect()
class AddressItem extends Component {
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

  shouldComponentUpdate(nextProps, nextState) {
    return (
      JSON.stringify(nextProps) !== JSON.stringify(this.props) ||
      JSON.stringify(this.state) !== JSON.stringify(nextState)
    );
  }

  onChange = value => {
    const {
      field: { name },
      required,
    } = this.props;
    let errorMsg = '';
    if (required && (!judgeIsNothing(value) || !value.province_id)) {
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

  renderAddress = () => {
    const { value } = this.state;
    const { field, template } = this.props;
    const prov = district.find(item => item.id === value.province_id) || {};
    const county = district.find(item => item.id === value.county_id) || {};
    const city = district.find(item => item.id === value.city_id) || {};
    const address = `${prov.name || ''}${county.name || ''}${city.name || ''}${value.address ||
      ''}`;
    return (
      <DetailItem {...field} template={template}>
        <span>{address}</span>
      </DetailItem>
    );
  };

  render() {
    const {
      field,
      required,
      disabled,
      readonly,
      template,
      ratio: { xRatio, yRatio },
    } = this.props;
    const { value, errorMsg } = this.state;
    if (readonly) {
      return this.renderAddress();
    }
    return (
      <FormItem
        className={style.address}
        {...field}
        required={required}
        errorMsg={errorMsg}
        template={template}
        extraStyle={{ minWidth: `${8 * xRatio}px`, height: `${2 * yRatio}px` }}
      >
        <div className={errorMsg ? style.errorMsg : style.noerror}>
          <Address
            {...field}
            value={value}
            disabled={disabled}
            onChange={this.onChange}
            name={{
              province_id: 'province_id',
              city_id: 'city_id',
              county_id: 'county_id',
              address: 'address',
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
