import React, { PureComponent } from 'react';
import { connect } from 'dva';
import FormItem from '../FormItem';
import DetailItem from '../DetailItem';
import SelectShop from '../../SelectShop';
import Select from '../../Select';
import { judgeIsNothing, validValue } from '../../../utils/utils';
import style from './index.less';

const defaultInfo = '请选择';
@connect()
class ShopSelectItem extends PureComponent {
  constructor(props) {
    super(props);
    const { defaultValue } = this.props;
    const shops = judgeIsNothing(defaultValue) ? defaultValue : '';
    this.state = {
      value: shops,
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

  renderSelect = options => {
    const {
      field,
      field: { id, description },
      extraStyle,
      template,
      required,
      ratio: { xRatio },
      disabled,
    } = this.props;
    const { errorMsg, value } = this.state;
    const muti = field.is_checkbox;
    let newValue = '';
    if (value) {
      newValue = muti ? value.map(item => item.value) : value.value;
    }
    const newId = `${id}-select`;
    const desc = description || `${defaultInfo}`;

    if (!muti) {
      const className = [style.select, errorMsg ? style.errorMsg : ''].join(' ');
      return (
        <FormItem
          {...field}
          disabled={disabled}
          errorMsg={errorMsg}
          required={required}
          template={template}
          extraStyle={extraStyle}
        >
          <div className={className} id={newId} style={{ height: '100%' }}>
            <Select
              showSearch
              disabled={disabled}
              options={options}
              placeholder={desc}
              value={newValue}
              optionFilterProp="children"
              allowClear
              getPopupContainer={() => document.getElementById(newId)}
              onChange={v => this.onSelectChange(v, 0)}
            />
          </div>
        </FormItem>
      );
    }
    const className = [style.mutiselect, errorMsg ? style.errorMsg : ''].join(' ');
    return (
      <FormItem
        {...field}
        height="auto"
        errorMsg={errorMsg}
        required={required}
        template={template}
        disabled={disabled}
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
            showSearch
            placeholder={desc}
            optionFilterProp="children"
            value={newValue}
            onChange={v => this.onSelectChange(v, 1)}
            getPopupContainer={() => document.getElementById(newId)}
            disabled={disabled}
          />
        </div>
      </FormItem>
    );
  };

  renderInfo = (
    value,
    { field, template, field: { row }, ratio: { smXRatio, smYRatio } },
    multiple
  ) => (
    <DetailItem
      {...field}
      template={template}
      text={multiple ? (value || []).map(item => item.text).join('、') : value.text || ''}
      extraStyle={
        multiple
          ? {
              height: 'auto',
              minHeight: template ? `auto` : `${smYRatio}px`,
              minWidth: !template ? `${10 * smXRatio}px` : `auto`,
            }
          : {}
      }
    >
      <span> {multiple ? (value || []).map(item => item.text).join('、') : value.text || ''}</span>
    </DetailItem>
  );

  render() {
    const {
      field,
      field: { max, min, description },
      required,
      disabled,
      template,
      ratio: { xRatio },
      readonly,
      extraStyle,
      defaultValue,
    } = this.props;
    const { errorMsg, value } = this.state;
    const multiple = field.is_checkbox;
    if (readonly) {
      return this.renderInfo(value, this.props, multiple);
    }
    const options = field.available_options;
    const className = [style.mutiselect, errorMsg ? style.errorMsg : ''].join(' ');
    if (options.length) {
      return this.renderSelect(options);
    }
    return (
      <FormItem
        {...field}
        errorMsg={errorMsg}
        disabled={disabled}
        required={required}
        template={template}
        rightStyle={{ overflowY: multiple ? 'scroll' : 'hidden' }}
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
          <SelectShop
            multiple={multiple}
            defaultValue={defaultValue}
            value={value}
            description={description}
            range={{ max, min }}
            effect="staff/fetchShops"
            onChange={multiple ? this.onMutiChange : this.onSingleChange}
            disabled={disabled}
          />
        </div>
      </FormItem>
    );
  }
}
ShopSelectItem.defaultProps = {
  onChange: () => {},
  ratio: {},
  formName: { name: 'text', shop_sn: 'value' },
};
export default ShopSelectItem;
