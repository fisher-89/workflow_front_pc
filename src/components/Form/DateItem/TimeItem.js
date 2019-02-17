import React, { PureComponent } from 'react';
import moment from 'moment';
import FormItem from '../FormItem';
import DetailItem from '../DetailItem';

import TimePicker from '../../TimePicker';
import { judgeIsNothing } from '../../../utils/utils';

import style from './index.less';

const defaultInfo = '请选择';

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

  handleOnChange = v => {
    let errorMsg = '';
    const {
      field: { name },
      required,
      onChange,
    } = this.props;
    const value = v ? `${v}:00` : '';
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

  renderInfo = (value, field, template) => (
    <DetailItem {...field} template={template}>
      <span>{value ? value.slice(0, -3) : ''}</span>
    </DetailItem>
  );

  render() {
    const {
      field,
      required,
      disabled,
      readonly,
      template,
      field: { max, min, description },
    } = this.props;
    const { errorMsg, value } = this.state;
    const className = [style.date, errorMsg ? style.errorMsg : ''].join(' ');
    const newValue = value ? moment(value, 'HH:mm') : null;
    const desc = description || `${defaultInfo}`;

    if (readonly) {
      return this.renderInfo(value, field, template);
    }
    return (
      <FormItem
        {...field}
        errorMsg={errorMsg}
        required={required}
        template={template}
        disabled={disabled}
      >
        <div className={className}>
          <TimePicker
            value={newValue}
            range={{ min, max }}
            disabled={disabled}
            placeholder={desc}
            popupClassName={style.time_popup}
            format="HH:mm"
            onChange={this.handleOnChange}
          />
        </div>
      </FormItem>
    );
  }
}

export default TimeItem;
