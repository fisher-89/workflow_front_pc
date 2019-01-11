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
      ? makeFieldValue(muti ? selected : selected[0], { id: 'value', name: 'text' }, muti)
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

  fetchDepatment = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'staff/fetchDepartment',
    });
  };

  renderSelect = options => {
    const {
      field,
      field: { id, description, name, row },
      required,
      ratio: { xRatio, yRatio },
      disabled,
    } = this.props;
    const { errorMsg, value } = this.state;
    const muti = field.is_checkbox;
    let newValue = '';
    if (judgeIsNothing(value)) {
      newValue = muti ? (value || []).map(item => item.value) : value.value;
    }
    const newId = `${id}-select`;
    const desc = description || `${defaultInfo}${name}`;

    if (!muti) {
      const className = [style.select, errorMsg ? style.errorMsg : ''].join(' ');
      return (
        <FormItem {...field} errorMsg={errorMsg} required={required}>
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
        extraStyle={{
          height: 'auto',
          minWidth: `${4 * xRatio}px`,
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
      extraStyle={
        multiple
          ? {
              height: 'auto',
              minHeight: template ? `${row * smYRatio}px` : `${smYRatio}px`,
              minWidth: template ? `${8 * smXRatio}px` : `${4 * smXRatio}px`,
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

  render() {
    const {
      field,
      field: { name, description },
      required,
      department,
      ratio: { xRatio },
      readonly,
    } = this.props;
    const { errorMsg, value } = this.state;
    const multiple = field.is_checkbox;
    const options = field.available_options;
    if (readonly) {
      return this.renderInfo(value, this.props, multiple);
    }
    if (options.length) {
      return this.renderSelect(options);
    }
    const newTreeData = markTreeData(
      department,
      { value: 'id', label: 'name', parentId: 'parent_id' },
      0
    );
    const desc = description || `${defaultInfo}${name}`;

    if (multiple) {
      const className = [style.mutiselect, errorMsg ? style.errorMsg : ''].join(' ');
      const newValue = (value || []).map(item => item.value);
      return (
        <FormItem
          {...field}
          height="auto"
          errorMsg={errorMsg}
          required={required}
          extraStyle={{ height: 'auto', minWidth: `${8 * xRatio}px` }}
        >
          <div className={className}>
            <TreeSelect
              dropdownClassName={style.dropdown}
              placeholder={desc}
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
      <FormItem {...field} height="auto" errorMsg={errorMsg} required={required}>
        <div className={className}>
          <TreeSelect
            dropdownClassName={style.dropdown}
            placeholder={desc}
            showSearch
            allowClear
            value={newValue}
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
