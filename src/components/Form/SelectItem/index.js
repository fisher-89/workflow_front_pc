import React, { Component } from 'react';
import FormItem from '../FormItem';
import DetailItem from '../DetailItem';

import Select from '../../Select';
import { validValue } from '../../../utils/utils';
import style from './index.less';

const defaultInfo = '请选择';
class SelectItem extends Component {
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

  shouldComponentUpdate(nextProps, nextState) {
    return (
      JSON.stringify(nextProps) !== JSON.stringify(this.props) ||
      JSON.stringify(this.state) !== JSON.stringify(nextState)
    );
  }

  onSingleChange = value => {
    this.dealValueOnChange(value);
  };

  onMutiChange = value => {
    this.dealValueOnChange(value);
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

  getOptions = () => {
    const {
      field: { options },
    } = this.props;
    const newOpts = (options || []).map(item => {
      const opt = { value: item, text: item };
      return opt;
    });
    return newOpts;
  };

  renderInfo = (value, { field, template, ratio: { smXRatio, smYRatio } }, multiple) => (
    <DetailItem
      {...field}
      extraStyle={
        multiple
          ? {
              minHeight: template ? `auto` : `${smYRatio}px`,
              minWidth: template ? `auto` : `${10 * smXRatio}px`,
            }
          : {}
      }
      template={template}
    >
      <span> {multiple ? (value || []).join('、') : value}</span>
    </DetailItem>
  );

  render() {
    const {
      field,
      field: { id, description, row },
      required,
      disabled,
      template,
      ratio: { xRatio, yRatio },
      readonly,
    } = this.props;
    const { errorMsg, value } = this.state;
    const options = this.getOptions();
    const newId = `${id}-select`;
    if (readonly) {
      return this.renderInfo(value, this.props, field.is_checkbox);
    }
    const desc = description || `${defaultInfo}`;
    if (!field.is_checkbox) {
      const className = [style.select, errorMsg ? style.errorMsg : ''].join(' ');
      return (
        <FormItem
          {...field}
          errorMsg={errorMsg}
          template={template}
          required={required}
          disabled={disabled}
        >
          <div className={className} id={newId} style={{ height: '100%' }}>
            <Select
              disabled={disabled}
              options={options}
              value={value}
              placeholder={desc}
              showArrow
              showSearch
              optionFilterProp="children"
              onChange={this.onSingleChange}
              getPopupContainer={() => document.getElementById(newId)}
            />
          </div>
        </FormItem>
      );
    }
    const className = [style.mutiselect, errorMsg ? style.errorMsg : ''].join(' ');
    return (
      <FormItem
        {...field}
        errorMsg={errorMsg}
        required={required}
        template={template}
        disabled={disabled}
        extraStyle={{
          height: 'auto',
          minWidth: !template ? `${10 * xRatio}px` : 'auto',
          minHeight: `${row * yRatio}px`,
        }}
      >
        <div className={className} id={newId} style={{ height: '100%' }}>
          <Select
            options={options}
            mode="multiple"
            value={value}
            placeholder={desc}
            allowClear={false}
            onChange={this.onMutiChange}
            getPopupContainer={() => document.getElementById(newId)}
            disabled={disabled}
          />
        </div>
      </FormItem>
    );
  }
}

export default SelectItem;
