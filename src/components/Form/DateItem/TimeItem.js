import React, { PureComponent } from 'react';
import moment from 'moment';
import FormItem from '../FormItem';
import DetailItem from '../DetailItem';

import TimePicker from '../../TimePicker';
import { judgeIsNothing } from '../../../utils/utils';

import style from './index.less';

class TimeItem extends PureComponent {
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
    if (required && !judgeIsNothing(value)) {
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

  renderInfo = (value, field) => (
    <DetailItem {...field}>
      <span>{value}</span>
    </DetailItem>
  );

  render() {
    const {
      field,
      required,
      disabled,
      readonly,
      field: { max, min },
    } = this.props;
    const { errorMsg, value } = this.state;
    const className = [style.date, errorMsg ? style.errorMsg : ''].join(' ');
    const newValue = value ? moment(value, 'HH:mm:ss') : null;
    if (readonly) {
      return this.renderInfo(value, field);
    }
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
