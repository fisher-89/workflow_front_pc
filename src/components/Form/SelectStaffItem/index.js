import React, { PureComponent } from 'react';
import { connect } from 'dva';
import FormItem from '../FormItem';
import DetailItem from '../DetailItem';

import SelectStaff from '../../SelectStaff';
import Select from '../../Select';
import { judgeIsNothing, validValue } from '../../../utils/utils';

import style from './index.less';

const defaultInfo = '请选择';

@connect()
class SelectStaffItem extends PureComponent {
  constructor(props) {
    super(props);
    const { defaultValue } = this.props;
    const staffs = judgeIsNothing(defaultValue) ? defaultValue : '';
    this.state = {
      value: staffs,
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

  renderInfo = (value, { field, template, ratio: { smXRatio, smYRatio } }, multiple) => (
    <DetailItem
      {...field}
      template={template}
      extraStyle={
        multiple
          ? {
              minHeight: template ? `auto` : `${smYRatio}px`,
              minWidth: template ? `auto` : `${10 * smXRatio}px`,
            }
          : {}
      }
    >
      {value ? (
        <span>{multiple ? (value || []).map(item => item.text).join('，') : value.text || ''}</span>
      ) : (
        ''
      )}
    </DetailItem>
  );

  renderSelect = options => {
    const {
      field,
      field: { id, description, name },
      required,
      ratio: { xRatio },
      disabled,
      extraStyle,
      template,
      asideStyle,
    } = this.props;
    const { errorMsg, value } = this.state;
    const muti = field.is_checkbox;
    let newValue = '';
    if (value) {
      newValue = muti ? value.map(item => item.value) : value.value;
    }
    const newId = `${id}-select`;
    const desc = description || `${defaultInfo}${name}`;

    if (!muti) {
      const className = [style.select, errorMsg ? style.errorMsg : ''].join(' ');
      return (
        <FormItem
          {...field}
          errorMsg={errorMsg}
          required={required}
          asideStyle={asideStyle}
          extraStyle={extraStyle}
          template={template}
        >
          <div className={className} id={newId} style={{ height: '100%' }}>
            <Select
              disabled={disabled}
              options={options}
              placeholder={desc}
              value={newValue}
              showSearch
              optionFilterProp="children"
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
        errorMsg={errorMsg}
        required={required}
        template={template}
        extraStyle={{
          // height: 'auto',
          minWidth: !template ? `${10 * xRatio}px` : 'auto',
          // minHeight: `${row * yRatio}px`,
          ...extraStyle,
        }}
      >
        <div className={className} id={newId} style={{ height: '100%' }}>
          <Select
            options={options}
            mode="multiple"
            allowClear={false}
            placeholder={desc}
            value={newValue}
            showSearch
            optionFilterProp="children"
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
      field: { max, min, description, name },
      required,
      template,
      ratio: { xRatio },
      disabled,
      defaultValue,
      rightStyle,
      asideStyle,
      extraStyle,
      readonly,
    } = this.props;
    const { errorMsg, value } = this.state;
    const desc = description || `请输入${name}`;
    const multiple = field.is_checkbox;
    if (readonly) {
      return this.renderInfo(value, this.props, multiple);
    }
    const options = field.available_options || [];
    const className = [style.mutiselect, errorMsg ? style.errorMsg : ''].join(' ');
    if (options.length) {
      return this.renderSelect(options);
    }
    return (
      <FormItem
        {...field}
        errorMsg={errorMsg}
        disabled={disabled}
        asideStyle={asideStyle}
        rightStyle={{ overflowY: multiple ? 'scroll' : 'hidden', ...rightStyle }}
        required={required}
        template={template}
        extraStyle={{
          // height: 'auto',
          // minHeight: template ? `${row * yRatio}px` : '75px',
          ...(multiple && !template ? { minWidth: `${10 * xRatio}px` } : null),
          ...extraStyle,
        }}
      >
        <div
          className={className}
          style={{ ...(disabled ? { backgroundColor: '#f0f0f0', cursor: 'not-allowed' } : {}) }}
        >
          <SelectStaff
            multiple={multiple}
            description={desc}
            defaultValue={defaultValue}
            name={this.props.formName}
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
  ratio: {},
  formName: { realname: 'text', staff_sn: 'value' },
};
export default SelectStaffItem;
