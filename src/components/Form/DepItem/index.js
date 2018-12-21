import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { TreeSelect } from 'antd';
import FormItem from '../FormItem';

import Select from '../../Select';
import { makeFieldValue, markTreeData, judgeIsNothing } from '../../../utils/utils';
import style from './index.less';

@connect(({ staff }) => ({ department: staff.department }))
class SelectDepItem extends PureComponent {
  constructor(props) {
    super(props);
    const { defaultValue, field } = this.props;
    const muti = field.is_checkbox;
    const depart = defaultValue || (muti ? [] : '');
    this.state = {
      value: depart,
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
      selected = tempDeps.filter(item => (`${v}` || '').indexOf(item.id) > -1);
    } else {
      selected = tempDeps.filter(item => `${v}` === item.id);
    }
    const newValue = selected.length
      ? makeFieldValue(muti ? selected : selected[0], { id: 'value', name: 'text' }, muti)
      : '';
    this.dealValueOnChange(newValue);
  };

  onSelectChange = value => {
    const { field } = this.props;
    const options = field.available_options;
    const selected = options.filter(item => value.indexOf(item.value) > -1);
    const newValue = selected.length ? selected : '';
    this.dealValueOnChange(newValue);
  };

  dealValueOnChange = value => {
    const {
      field: { name },
      required,
      onChange,
    } = this.props;

    let errorMsg = '';
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

  fetchDepatment = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'staff/fetchDepartment',
    });
  };

  renderSelect = options => {
    const {
      field,
      field: { id },
      required,
      disabled,
    } = this.props;
    const { errorMsg, value } = this.state;
    const muti = field.is_checkbox;
    let newValue = '';
    if (value) {
      newValue = muti ? (value || []).map(item => item.value) : value.value;
    }
    const newId = `${id}-select`;

    if (!muti) {
      const className = [style.select, errorMsg ? style.errorMsg : ''].join(' ');
      return (
        <FormItem {...field} errorMsg={errorMsg} required={required}>
          <div className={className} id={newId}>
            <Select
              disabled={disabled}
              options={options}
              value={newValue}
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
        extraStyle={{ height: 'auto', minWidth: '600px' }}
      >
        <div className={className} id={newId}>
          <Select
            options={options}
            mode="multiple"
            value={newValue}
            onChange={v => this.onSelectChange(v, 1)}
            getPopupContainer={() => document.getElementById(newId)}
            disabled={disabled}
          />
        </div>
      </FormItem>
    );
  };

  render() {
    const { field, required, department } = this.props;
    const { errorMsg, value } = this.state;
    const multiple = field.is_checkbox;
    const options = field.available_options;
    if (options.length) {
      return this.renderSelect(options);
    }
    const newTreeData = markTreeData(
      department,
      { value: 'id', label: 'name', parentId: 'parent_id' },
      0
    );
    if (multiple) {
      const className = [style.mutiselect, errorMsg ? style.errorMsg : ''].join(' ');
      const newValue = (value || []).map(item => item.value);
      return (
        <FormItem
          {...field}
          width="500"
          height="auto"
          errorMsg={errorMsg}
          required={required}
          extraStyle={{ height: 'auto', minWidth: '600px' }}
        >
          <div className={className}>
            <TreeSelect
              dropdownClassName={style.dropdown}
              maxTagCount={10}
              showSearch
              multiple
              value={newValue}
              allowClear
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
            maxTagCount={10}
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
