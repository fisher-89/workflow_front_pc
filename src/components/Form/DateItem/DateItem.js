import React, { PureComponent } from 'react';
import moment from 'moment';

import FormItem from '../FormItem';
import DetailItem from '../DetailItem';
import DatePicker from '../../DatePicker';
import { judgeIsNothing } from '../../../utils/utils';

import style from './index.less';

const defaultInfo = '请选择';
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
      <span>{value}</span>
    </DetailItem>
  );

  render() {
    const {
      field,
      required,
      disabled,
      readonly,
      template,
      field: { max, min, type, description },
      ratio: { xRatio },
    } = this.props;
    const { errorMsg, value } = this.state;
    const className = [style.date, errorMsg ? style.errorMsg : ''].join(' ');
    const newValue = value ? moment(value) : null;
    if (readonly) {
      return this.renderInfo(value, field, template);
    }
    const desc = description || `${defaultInfo}`;
    if (type === 'datetime') {
      return (
        <FormItem
          {...field}
          errorMsg={errorMsg}
          required={required}
          template={template}
          disabled={disabled}
          extraStyle={!template ? { minWidth: `${6 * xRatio}px` } : null}
        >
          <div className={className}>
            <DatePicker
              disabled={disabled}
              placeholder={desc}
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
      <FormItem
        {...field}
        errorMsg={errorMsg}
        required={required}
        template={template}
        disabled={disabled}
      >
        <div className={className}>
          <DatePicker
            disabled={disabled}
            value={newValue}
            placeholder={desc}
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
