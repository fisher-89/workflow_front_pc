import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';

import FormItem from '../FormItem';
import DatePicker from '../../DatePicker';
import style from './index.less';

@connect(({ interfaceApi }) => ({ sourceDetails: interfaceApi.sourceDetails }))
class SelectItem extends PureComponent {
  constructor(props) {
    super(props);
    const { defaultValue } = this.props;
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

  handleOnChange = value => {
    let errorMsg = '';
    const {
      field: { name },
      required,
      onChange,
    } = this.props;
    if (required && !value) {
      errorMsg = `请选择${name}`;
    }
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

  render() {
    const {
      field,
      required,
      disabled,
      field: { max, min, type },
    } = this.props;
    const { errorMsg, value } = this.state;
    const className = [style.date, errorMsg ? style.errorMsg : ''].join(' ');
    const newValue = value ? moment(value) : null;
    if (type === 'datetime') {
      return (
        <FormItem {...field} errorMsg={errorMsg} required={required}>
          <div className={className}>
            <DatePicker
              disabled={disabled}
              value={newValue}
              range={{ min, max }}
              popupClassName={style.date_popup}
              format="YYYY-MM-DD HH:mm:ss"
              showTime
              onChange={this.handleOnChange}
            />
          </div>
        </FormItem>
      );
    }
    return (
      <FormItem {...field} errorMsg={errorMsg} required={required}>
        <div className={className}>
          <DatePicker
            disabled={disabled}
            value={newValue}
            range={{ min, max }}
            format="YYYY-MM-DD"
            onChange={this.handleOnChange}
          />
        </div>
      </FormItem>
    );
  }
}

export default SelectItem;
