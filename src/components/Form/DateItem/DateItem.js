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

  handleOnChange = value => {
    let errorMsg = '';
    const {
      field: { name },
    } = this.props;
    if (!value.length) {
      errorMsg = `请选择${name}`;
    }
    this.setState({
      value,
      errorMsg,
    });
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
