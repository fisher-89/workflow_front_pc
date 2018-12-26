import React, { PureComponent } from 'react';
import { connect } from 'dva';
import FormItem from '../FormItem';
import SelectStaff from '../../SelectStaff';
import Select from '../../Select';
import { judgeIsNothing, validValue } from '../../../utils/utils';

import style from './index.less';

@connect()
class SelectStaffItem extends PureComponent {
  constructor(props) {
    super(props);
    const { defaultValue } = this.props;
    console.log('defaultValue: ', defaultValue);

    const staffs = judgeIsNothing(defaultValue) ? defaultValue : '';
    this.state = {
      value: staffs,
      errorMsg: '',
    };
  }

  componentWillMount() {}

  componentWillReceiveProps(props) {
    const { value, errorMsg } = props;
    if (JSON.stringify(value) !== this.props.value || errorMsg !== this.props.errorMsg) {
      this.setState({
        value,
        errorMsg,
      });
    }
  }

  onSingleChange = value => {
    this.dealValueOnChange(value);
  };

  onMutiChange = value => {
    this.dealValueOnChange(value);
  };

  onSelectChange = (value, muti) => {
    const { field } = this.props;
    const options = field.available_options;
    let newValue = '';
    if (muti) {
      newValue = options.filter(item => value.indexOf(item.value) > -1);
    } else {
      newValue = options.find(item => value === item.value);
    }
    this.dealValueOnChange(newValue || (muti ? [] : ''));
  };

  dealValueOnChange = value => {
    const { onChange } = this.props;
    const errorMsg = validValue(value, this.props);
    this.setState(
      {
        value,
        errorMsg,
      },
      () => {
        onChange(value, errorMsg);
      }
    );
  };

  renderSelect = options => {
    const {
      field,
      field: { id },
      required,
      disabled,
      asideStyle,
    } = this.props;
    const { errorMsg, value } = this.state;
    const muti = field.is_checkbox;
    let newValue = '';
    if (value) {
      newValue = muti ? value.map(item => item.value) : value.value;
    }
    const newId = `${id}-select`;

    if (!muti) {
      const className = [style.select, errorMsg ? style.errorMsg : ''].join(' ');
      return (
        <FormItem {...field} errorMsg={errorMsg} required={required} asideStyle={asideStyle}>
          <div className={className} id={newId}>
            <Select
              disabled={disabled}
              options={options}
              value={newValue}
              getPopupContainer={() => document.getElementById(newId)}
              onChange={this.onSelectChange}
            />
          </div>
        </FormItem>
      );
    }
    const className = [style.mutiselect, errorMsg ? style.errorMsg : ''].join(' ');
    return (
      <FormItem
        {...field}
        asideStyle={asideStyle}
        height="auto"
        errorMsg={errorMsg}
        required={required}
        extraStyle={{ height: 'auto', minWidth: '600px' }}
      >
        <div className={className} id={newId}>
          <Select
            options={options}
            mode="multiple"
            value={newValue}
            onChange={v => this.onSelectChange(v, 1)}
            getPopupContainer={() => document.getElementById(newId)}
            disabled={disabled}
          />
        </div>
      </FormItem>
    );
  };

  render() {
    const {
      field,
      field: { max, min },
      required,
      disabled,
      defaultValue,
      asideStyle,
    } = this.props;
    const { errorMsg, value } = this.state;
    const multiple = field.is_checkbox;
    const options = field.available_options;
    const className = [style.mutiselect, errorMsg ? style.errorMsg : ''].join(' ');
    if (options.length) {
      return this.renderSelect(options);
    }
    return (
      <FormItem
        {...field}
        width="500"
        height="auto"
        errorMsg={errorMsg}
        asideStyle={asideStyle}
        required={required}
        extraStyle={{ height: 'auto', minWidth: '600px' }}
      >
        <div className={className}>
          <SelectStaff
            multiple={multiple}
            defaultValue={defaultValue}
            name={this.props.name}
            value={value}
            range={{ max, min }}
            effect="staff/fetchStaffs"
            onChange={multiple ? this.onMutiChange : this.onSingleChange}
            disabled={disabled}
          />
        </div>
      </FormItem>
    );
  }
}
SelectStaffItem.defaultProps = {
  onChange: () => {},
  name: { realname: 'text', staff_sn: 'value' },
};
export default SelectStaffItem;
