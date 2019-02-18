import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { TreeSelect } from 'antd';
import FormItem from '../FormItem';
import DetailItem from '../DetailItem';
import Select from '../../Select';
import { makeFieldValue, markTreeData, judgeIsNothing, validValue } from '../../../utils/utils';
import style from './index.less';

const defaultInfo = '请选择';
@connect(({ staff }) => ({ department: staff.department }))
class SelectDepItem extends PureComponent {
  constructor(props) {
    super(props);
    const { defaultValue } = this.props;
    const deps = judgeIsNothing(defaultValue) ? defaultValue : '';
    this.state = {
      value: deps,
      errorMsg: '',
    };
  }

  componentWillMount() {
    this.fetchDepatment();
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

  onTreeChange = (v, muti) => {
    const { department } = this.props;
    const tempDeps = department.map(item => ({ ...item, id: `${item.id}` }));
    let selected = '';
    if (muti) {
      selected = tempDeps.filter(item => v.map(it => `${it}`).indexOf(item.id) > -1);
    } else {
      selected = tempDeps.filter(item => `${v}` === item.id);
    }
    const newValue = selected.length
      ? makeFieldValue(muti ? selected : selected[0], { id: 'value', full_name: 'text' }, muti)
      : '';

    this.dealValueOnChange(newValue);
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
    this.setState({
      value: newValue,
    });
  };

  onDeselect = removeId => {
    const { value } = this.state;
    const newValue = (value || []).filter(item => `${item.value}` !== `${removeId}`);
    this.dealValueOnChange(newValue);
  };

  onBlur = (e, muti) => {
    const { value } = this.state;
    this.dealValueOnChange(value || (muti ? [] : ''));
  };

  onFocus = () => {
    const { onChange } = this.props;
    const { value } = this.state;
    this.setState(
      {
        errorMsg: '',
      },
      () => {
        onChange(value, '');
      }
    );
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

  fetchDepatment = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'staff/fetchDepartment',
    });
  };

  renderSelect = options => {
    const {
      field,
      field: { id, description, row },
      required,
      template,
      ratio: { xRatio, yRatio },
      disabled,
    } = this.props;
    const { errorMsg, value } = this.state;
    const muti = field.is_checkbox;
    let newValue = '';
    if (judgeIsNothing(value)) {
      newValue = muti ? (value || []).map(item => `${item.value}`) : `${value.value}`;
    }
    const newId = `${id}-select`;
    const desc = description || `${defaultInfo}`;

    if (!muti) {
      const className = [style.select, errorMsg ? style.errorMsg : ''].join(' ');
      if (newValue && !options.find(item => `${item.value}` === `${newValue}`)) {
        newValue = value.text;
      }
      return (
        <FormItem {...field} template={template} errorMsg={errorMsg} required={required}>
          <div className={className} id={newId}>
            <Select
              disabled={disabled}
              options={options}
              value={newValue}
              placeholder={desc}
              showSearch
              optionFilterProp="children"
              getPopupContainer={() => document.getElementById(newId)}
              onChange={this.onSelectChange}
              onBlur={this.onBlur}
              onFocus={this.onFocus}
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
        extraStyle={{
          height: 'auto',
          minWidth: !template ? `${10 * xRatio}px` : 'auto',
          minHeight: `${row * yRatio}px`,
        }}
      >
        <div className={className} id={newId}>
          <Select
            options={options}
            mode="multiple"
            allowClear={false}
            showSearch
            placeholder={desc}
            optionFilterProp="children"
            value={newValue}
            onChange={v => this.onSelectChange(v, 1)}
            onBlur={e => this.onBlur(e, 1)}
            onFocus={this.onFocus}
            onDeselect={this.onDeselect}
            getPopupContainer={() => document.getElementById(newId)}
            disabled={disabled}
          />
        </div>
      </FormItem>
    );
  };

  renderInfo = (value, { field, template, ratio: { smXRatio, smYRatio } }, multiple) => (
    <DetailItem
      {...field}
      template={template}
      extraStyle={
        multiple
          ? {
              height: 'auto',
              minHeight: template ? `auto` : `${smYRatio}px`,
              minWidth: template ? `auto` : `${10 * smXRatio}px`,
            }
          : {}
      }
    >
      {' '}
      {value ? (
        <span>
          {' '}
          {multiple ? (value || []).map(item => item.text).join('、') : value.text || ''}{' '}
        </span>
      ) : (
        ''
      )}
    </DetailItem>
  );

  render() {
    const {
      field,
      field: { description },
      required,
      department,
      template,
      ratio: { xRatio },
      readonly,
      disabled,
    } = this.props;
    const { errorMsg, value } = this.state;
    const multiple = field.is_checkbox;
    const options = (field.available_options || []).map(item => ({
      ...item,
      value: `${item.value}`,
    }));
    if (readonly) {
      return this.renderInfo(value, this.props, multiple);
    }
    if (options.length) {
      return this.renderSelect(options);
    }
    const newTreeData = markTreeData(
      department,
      { value: 'id', label: 'name', parentId: 'parent_id' },
      0,
      true
    );
    const desc = description || `${defaultInfo}`;

    if (multiple) {
      const className = [style.mutiselect, errorMsg ? style.errorMsg : ''].join(' ');
      const newValue = (value || []).map(item => item.value);
      return (
        <FormItem
          {...field}
          errorMsg={errorMsg}
          required={required}
          template={template}
          disabled={disabled}
          extraStyle={!template ? { minWidth: `${10 * xRatio}px` } : null}
        >
          <div className={className}>
            <TreeSelect
              disabled={disabled}
              dropdownClassName={style.dropdown}
              placeholder={desc}
              treeNodeLabelProp="full_name"
              showSearch
              multiple
              value={newValue}
              allowClear={false}
              treeData={newTreeData}
              onChange={v => this.onTreeChange(v, 1)}
              filterTreeNode={(inputValue, treeNode) =>
                treeNode.props.title.indexOf(inputValue) !== -1
              }
            />
          </div>
        </FormItem>
      );
    }
    const className = [style.select, errorMsg ? style.errorMsg : ''].join(' ');
    const newValue = value ? value.value : undefined;
    return (
      <FormItem
        {...field}
        errorMsg={errorMsg}
        required={required}
        disabled={disabled}
        template={template}
      >
        <div className={className}>
          <TreeSelect
            dropdownClassName={style.dropdown}
            placeholder={desc}
            showSearch
            allowClear
            value={newValue}
            treeNodeLabelProp="full_name"
            treeData={newTreeData}
            onChange={v => this.onTreeChange(v, 0)}
            filterTreeNode={(inputValue, treeNode) =>
              treeNode.props.title.indexOf(inputValue) !== -1
            }
          />
        </div>
      </FormItem>
    );
  }
}

export default SelectDepItem;
