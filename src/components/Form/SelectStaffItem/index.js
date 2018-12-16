import React, { PureComponent } from 'react';
import { connect } from 'dva';
import FormItem from '../FormItem';
import SelectStaff from '../../SelectStaff';
import { makeFieldValue } from '../../../utils/utils';
import style from './index.less';

@connect()
class SelectStaffItem extends PureComponent {
  constructor(props) {
    super(props);
    const { defaultValue, field } = this.props;
    const muti = field.is_checkbox;
    this.state = {
      value: defaultValue || (muti ? [] : ''),
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

  onSingleChange = value => {
    let errorMsg = '';
    const {
      field: { name },
      required,
    } = this.props;
    if (required && (value === null || value === undefined)) {
      errorMsg = `请选择${name}`;
    }
    this.setState(
      {
        value,
        errorMsg,
      },
      () => {
        const newValue = value
          ? makeFieldValue(value, { staff_sn: 'value', realname: 'text' }, false)
          : '';
        this.props.onChange(newValue, errorMsg);
      }
    );
  };

  onMutiChange = value => {
    let errorMsg = '';
    const {
      field: { name },
      onChange,
    } = this.props;
    if (!value.length) {
      errorMsg = `请选择${name}`;
    }
    this.setState(
      {
        value,
        errorMsg,
      },
      () => {
        const newValue = makeFieldValue(value, { staff_sn: 'value', realname: 'text' }, true);
        onChange(newValue, errorMsg);
      }
    );
  };

  fetchDataSource = params => {
    const {
      dispatch,
      field: { id },
    } = this.props;
    dispatch({
      type: 'staff/fetchStaffs',
      payload: {
        params: {
          id,
          ...params,
        },
      },
    });
  };

  render() {
    const { field, required, disabled } = this.props;
    const { errorMsg, value } = this.state;
    const multiple = field.is_checkbox;
    const newValue = value
      ? makeFieldValue(value, { value: 'staff_sn', text: 'realname' }, multiple)
      : '';

    const className = [style.mutiselect, errorMsg ? style.errorMsg : ''].join(' ');
    return (
      <FormItem
        {...field}
        height="auto"
        errorMsg={errorMsg}
        required={required}
        extraStyle={{ height: 'auto' }}
      >
        <div className={className}>
          <SelectStaff
            multiple={multiple}
            selfStyle={{ width: '780px' }}
            fetchDataSource={this.fetchDataSource}
            value={newValue}
            onChange={multiple ? this.onMutiChange : this.onSingleChange}
            disabled={disabled}
          />
        </div>
      </FormItem>
    );
  }
}

export default SelectStaffItem;
