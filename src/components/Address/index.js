import React, { PureComponent, Fragment } from 'react';
import { Input, Select } from 'antd';

import districtData from '../../assets/district';

const { district } = districtData;
const { Option } = Select;
const InputGroup = Input.Group;

export default class Address extends PureComponent {
  constructor(props) {
    super(props);
    const { value, name } = this.props;
    const defaultValue = this.combineValue(value, name);
    this.state = {
      province: [],
      city: [],
      county: [],
      value: defaultValue,
    };
  }

  componentDidMount() {
    this.makeSelectOption();
  }

  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(nextProps.value) !== JSON.stringify(this.props.value)) {
      const newValue = this.combineValue(nextProps.value, nextProps.name);
      this.setState({ value: newValue }, this.makeSelectOption);
    }
  }

  setPropsValue = () => {
    const { value } = this.state;
    const { onChange, name } = this.props;
    const newValue = {};
    Object.keys(name).forEach(key => {
      newValue[name[key]] = value[key];
    });
    onChange(newValue);
  };

  combineValue = (value, name) => {
    const newValue = value
      ? {
          province_id: value[name.province_id],
          city_id: value[name.city_id],
          county_id: value[name.county_id],
          address: value[name.address],
        }
      : {
          province_id: null,
          city_id: null,
          county_id: null,
          address: null,
        };
    return newValue;
  };

  makeSelectOption = () => {
    const { value } = this.state;
    const province = district.filter(item => item.parent_id === 0);
    let city = [];
    if (value && value.province_id) {
      city = district.filter(item => `${item.parent_id}` === `${value.province_id}`);
    }
    let county = [];
    if (value && value.city_id) {
      county = district.filter(item => `${item.parent_id}` === `${value.city_id}`);
    }
    this.setState({
      province,
      city,
      county,
    });
  };

  makeCity = value => {
    const city = district.filter(item => `${item.parent_id}` === `${value}`);
    const newValue = {
      province_id: value,
      city_id: null,
      county_id: null,
      address: null,
    };
    this.setState({ city, value: newValue }, this.setPropsValue);
  };

  makeCounty = cityId => {
    const { value } = this.state;
    const county = district.filter(item => `${item.parent_id}` === `${cityId}`);
    this.setState(
      {
        county,
        value: {
          ...value,
          city_id: cityId,
          county_id: null,
          address: null,
        },
      },
      this.setPropsValue
    );
  };

  render() {
    const { province, city, county, value } = this.state;
    const { disabled } = this.props;
    const regionLevel = this.props.region_level;
    return (
      <Fragment>
        <InputGroup compact>
          <Select
            disabled={disabled || regionLevel < 1}
            key="province_id"
            style={{ width: '33.33%' }}
            value={value.province_id ? value.province_id - 0 : ''}
            onChange={this.makeCity}
            allowClear
            placeholder="请选择"
          >
            {province.map(item => (
              <Option key={item.id} value={item.id}>
                {item.name}
              </Option>
            ))}
          </Select>
          <Select
            disabled={disabled || regionLevel < 2}
            key="city_id"
            style={{ width: '33.33%' }}
            value={value.city_id ? value.city_id - 0 : ''}
            onChange={this.makeCounty}
            allowClear
            placeholder="请选择"
          >
            {city.map(item => (
              <Option key={item.id} value={item.id}>
                {item.name}
              </Option>
            ))}
          </Select>
          <Select
            disabled={disabled || regionLevel < 3}
            key="countyId"
            style={{ width: '33.33%' }}
            allowClear
            onChange={countyId => {
              this.setState(
                {
                  value: {
                    ...value,
                    county_id: countyId,
                    address: null,
                  },
                },
                this.setPropsValue
              );
            }}
            value={value.county_id ? value.county_id - 0 : ''}
            placeholder="请选择"
          >
            {county.map(item => (
              <Option key={item.id} value={item.id}>
                {item.name}
              </Option>
            ))}
          </Select>
        </InputGroup>
        <Input.TextArea
          disabled={disabled || regionLevel < 4}
          onChange={e => {
            const address = e.target.value;
            this.setState({ value: { ...value, address } }, this.setPropsValue);
          }}
          style={{ resize: 'none' }}
          value={value.address}
          placeholder="详细地址，请输入0-30个字符"
        />
      </Fragment>
    );
  }
}

Address.defaultProps = {
  onChange: () => {},
  name: {
    province_id: 'province_id',
    city_id: 'city_id',
    county_id: 'county_id',
    address: 'address',
  },
};
