import React, { Component } from 'react';
import { connect } from 'dva';
import FormItem from '../FormItem';
import DetailItem from '../DetailItem';

import Select from '../../Select';
import { validValue } from '../../../utils/utils';
import style from './index.less';

const defaultInfo = '请选择';

@connect(({ interfaceApi }) => ({ sourceDetails: interfaceApi.sourceDetails }))
class InterfaceItem extends Component {
  constructor(props) {
    super(props);
    const { defaultValue, field } = this.props;
    const muti = field.is_checkbox;
    this.state = {
      value: defaultValue || (muti ? [] : ''),
      errorMsg: '',
    };
  }

  componentWillMount() {
    const { dispatch, field } = this.props;
    this.id = field.field_api_configuration_id;
    dispatch({
      type: 'interfaceApi/fetchApi',
      payload: {
        id: this.id,
      },
    });
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
    const { sourceDetails } = this.props;
    return sourceDetails[this.id] || [];
  };

  validateFile = (rule, value, callback) => {
    const { required } = this.props;
    if (required && (!value || value.length === 0)) {
      callback();
    } else callback();
  };

  renderInfo = (
    value,
    { field, template, field: { row }, ratio: { smYRatio, smXRatio } },
    multiple
  ) => (
    <DetailItem
      {...field}
      template={template}
      extraStyle={
        multiple
          ? {
              height: 'auto',
              minWidth: template ? `auto` : `${10 * smXRatio}px`,
              minHeight: template ? `auto` : `${smYRatio}px`,
            }
          : {}
      }
    >
      <span>{multiple ? (value || []).join('，') : value}</span>
    </DetailItem>
  );

  render() {
    const {
      field,
      field: { id, row, description },
      required,
      template,
      ratio: { yRatio, xRatio },
      disabled,
      readonly,
    } = this.props;
    const { errorMsg, value } = this.state;
    const options = this.getOptions();
    const newId = `${id}-select`;
    const desc = description || `${defaultInfo}`;

    if (readonly) {
      return this.renderInfo(value, this.props, field.is_checkbox);
    }
    if (!field.is_checkbox) {
      const className = [style.inteface, errorMsg ? style.errorMsg : ''].join(' ');
      return (
        <FormItem
          {...field}
          errorMsg={errorMsg}
          required={required}
          template={template}
          disabled={disabled}
        >
          <div className={className} id={newId} style={{ height: '100%' }}>
            <Select
              disabled={disabled}
              showSearch
              optionFilterProp="children"
              placeholder={desc}
              options={options}
              value={value}
              getPopupContainer={() => document.getElementById(newId)}
              onChange={this.onSingleChange}
            />
          </div>
        </FormItem>
      );
    }
    const className = [style.mutiinteface, errorMsg ? style.errorMsg : ''].join(' ');
    return (
      <FormItem
        {...field}
        height="auto"
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
            disabled={disabled}
            options={options}
            value={value || []}
            allowClear={false}
            showSearch
            placeholder={desc}
            optionFilterProp="children"
            mode="multiple"
            getPopupContainer={() => document.getElementById(newId)}
            onChange={this.onMutiChange}
          />
        </div>
      </FormItem>
    );
  }
}

export default InterfaceItem;
