import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';

import FormItem from '../FormItem';
import TimePicker from '../../TimePicker';
import style from './index.less';

@connect(({ interfaceApi }) => ({ sourceDetails: interfaceApi.sourceDetails }))
class TimeItem extends PureComponent {
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
      field: { max, min },
    } = this.props;
    const { errorMsg, value } = this.state;
    const className = [style.date, errorMsg ? style.errorMsg : ''].join(' ');
    const newValue = value ? moment(value, 'HH:mm:ss') : null;
    return (
      <FormItem {...field} errorMsg={errorMsg} required={required}>
        <div className={className}>
          <TimePicker
            value={newValue}
            range={{ min, max }}
            disabled={disabled}
            popupClassName={style.time_popup}
            format="HH:mm:ss"
            onChange={this.handleOnChange}
          />
        </div>
      </FormItem>
    );
  }
}

export default TimeItem;
