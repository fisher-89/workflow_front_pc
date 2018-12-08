import React, { PureComponent } from 'react';
import { Card, Button } from 'antd';
import { connect } from 'dva';
import {
  TextItem,
  AddressItem,
  UploadItem,
  InterfaceItem,
  SelectItem,
  ArrayItem,
  DateItem,
  TimeItem,
} from '../../components/Form/index';
import style from './index.less';

@connect(({ start }) => ({ startDetails: start.startDetails }))
class StartForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      formData: {},
    };
  }

  componentWillMount() {
    const {
      match: {
        params: { id },
      },
      startDetails,
    } = this.props;
    this.id = '6';
    const startflow = startDetails[this.id];
    this.startflow = startflow;
    this.availableForm = startflow.fields.form.filter(
      item => startflow.step.available_fields.indexOf(item.key) > -1
    );
    this.availableGrid = startflow.fields.grid.filter(
      item => startflow.step.available_fields.indexOf(item.key) > -1
    );
    this.editForm = startflow.fields.form.filter(
      item => startflow.step.editable_fields.indexOf(item.key) > -1
    );
    this.editGrid = startflow.fields.grid.filter(
      item => startflow.step.editable_fields.indexOf(item.key) > -1
    );
    this.initFormData();
  }

  initFormData = () => {
    const newForm = this.availableForm.concat(this.availableGrid);
    const formData = {};
    newForm.forEach(item => {
      const { key, fields } = item;
      const obj = {
        key,
        errorMsg: '',
      };
      const value = this.startflow.form_data[key];
      if (fields) {
        const gridValue = value.map(its => {
          const gridformData = {};
          Object.keys(its).forEach(it => {
            const temp = {
              key: it,
              errorMsg: '',
              value: its[it],
            };
            gridformData[it] = { ...temp };
          });
          return gridformData;
        });
        obj.value = [...gridValue];
      } else {
        obj.value = value;
      }
      formData[key] = { ...obj };
    });

    this.setState({
      formData,
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    console.log(this.state.formData);
  };

  handleOnChange = (value, errorMsg, keyInfo) => {
    const { isGrid } = keyInfo;
    if (isGrid) {
      this.gridOnChange(value, errorMsg, keyInfo);
    } else {
      this.formOnChange(value, errorMsg, keyInfo);
    }
  };

  gridOnChange = (value, errorMsg, keyInfo) => {
    const { gridKey, index, childKey } = keyInfo;
    const { formData } = this.state;
    const gridValueInfo = formData[gridKey];
    const curGridInfo = { ...gridValueInfo.value[index] };
    const newGridItem = { ...curGridInfo[childKey] };
    newGridItem.value = value;
    newGridItem.errorMsg = errorMsg;
    curGridInfo[childKey] = { ...newGridItem };
    gridValueInfo.value[index] = { ...curGridInfo };
    this.setState({
      formData: {
        ...formData,
        [gridKey]: gridValueInfo,
      },
    });
  };

  formOnChange = (value, errorMsg, keyInfo) => {
    const { formKey } = keyInfo;
    const { formData } = this.state;
    const curValueInfo = formData[formKey];
    const newValueInfo = {
      ...curValueInfo,
      errorMsg,
      value,
    };
    this.setState({
      formData: {
        ...formData,
        [formKey]: newValueInfo,
      },
    });
  };

  gridAdd = (item, valueInfo) => {
    const { key } = item;
    const { formData } = this.state;
    const defaultValue = item.field_default_value;
    const curValue = {};
    Object.keys(defaultValue).forEach(childKey => {
      const value = defaultValue[childKey];
      curValue[childKey] = {
        value,
        errorMsg: '',
        key: childKey,
      };
    });
    const newValueInfo = {
      ...valueInfo,
      value: [...valueInfo.value, curValue],
    };
    this.setState({
      formData: {
        ...formData,
        [key]: newValueInfo,
      },
    });
  };

  deleteGridItem = (item, valueInfo, index) => {
    const { formData } = this.state;
    const { key } = item;
    const gridValueInfo = [...valueInfo.value];
    const newGridValueInfo = gridValueInfo.slice(0, index).concat(gridValueInfo.slice(index + 1));
    const newValueInfo = {
      ...valueInfo,
      value: [...newGridValueInfo],
    };
    this.setState({
      formData: {
        ...formData,
        [key]: newValueInfo,
      },
    });
  };

  renderFormItem = (item, formInfo, keyInfo) => {
    const { type } = item;
    switch (type) {
      case 'time':
        return this.renderTimeItem(item, formInfo, keyInfo);
      case 'datetime':
      case 'date':
        return this.renderDateItem(item, formInfo, keyInfo);
      case 'array':
        return this.renderArray(item, formInfo, keyInfo);
      case 'text':
      case 'int':
        return this.renderTextItem(item, formInfo, keyInfo);
      case 'select':
        return this.renderSelectItem(item, formInfo, keyInfo);
      case 'interface':
        return this.renderItemfaceItem(item, formInfo, keyInfo);
      case 'file':
        return this.renderFileItem(item, formInfo, keyInfo);
      case 'address':
        return this.renderAddressItem(item, formInfo, keyInfo);
      default:
        return null;
    }
  };

  renderDateTime = (item, formInfo, keyInfo) => {
    const { value } = formInfo;
    const { domKey } = keyInfo;
    return (
      <div className={style.edit_form} style={{ height: '200px' }} key={domKey}>
        <TimeItem
          {...item}
          field={item}
          defaultValue={value}
          {...formInfo}
          onChange={this.handleOnChange}
        />
      </div>
    );
  };

  renderArray = (item, formInfo, keyInfo) => {
    const { value } = formInfo;
    const { domKey } = keyInfo;

    return (
      <div className={style.edit_form} key={domKey} style={{ height: '200px' }}>
        <ArrayItem
          field={item}
          defaultValue={value}
          {...formInfo}
          onChange={(v, msg) => this.handleOnChange(v, msg, keyInfo)}
        />
      </div>
    );
  };

  renderFileItem = (item, formInfo, keyInfo) => {
    const { value } = formInfo;
    const { domKey } = keyInfo;

    return (
      <div className={style.edit_form} key={domKey} style={{ height: '200px' }}>
        <UploadItem
          field={item}
          defaultValue={value}
          {...formInfo}
          onChange={(v, msg) => this.handleOnChange(v, msg, keyInfo)}
        />
      </div>
    );
  };

  renderTextItem = (item, formInfo, keyInfo) => {
    const { value } = formInfo;
    const { domKey } = keyInfo;

    return (
      <div className={style.edit_form} key={domKey} style={{ height: '200px' }}>
        <TextItem
          field={item}
          defaultValue={value}
          {...formInfo}
          onChange={(v, msg) => this.handleOnChange(v, msg, keyInfo)}
        />
      </div>
    );
  };

  renderDateItem = (item, formInfo, keyInfo) => {
    const { value } = formInfo;
    const { domKey } = keyInfo;
    return (
      <div className={style.edit_form} key={domKey} style={{ height: '200px' }}>
        <DateItem
          field={item}
          defaultValue={value}
          {...formInfo}
          onChange={(v, msg) => this.handleOnChange(v, msg, keyInfo)}
        />
      </div>
    );
  };

  renderTimeItem = (item, formInfo, keyInfo) => {
    const { value } = formInfo;
    const { domKey } = keyInfo;
    return (
      <div className={style.edit_form} key={domKey} style={{ height: '200px' }}>
        <TimeItem
          field={item}
          defaultValue={value}
          {...formInfo}
          onChange={(v, msg) => this.handleOnChange(v, msg, keyInfo)}
        />
      </div>
    );
  };

  renderSelectItem = (item, formInfo, keyInfo) => {
    const { value } = formInfo;
    const { domKey } = keyInfo;

    return (
      <div className={style.edit_form} key={domKey} style={{ height: '200px' }}>
        <SelectItem
          field={item}
          defaultValue={value}
          {...formInfo}
          onChange={(v, msg) => this.handleOnChange(v, msg, keyInfo)}
        />
      </div>
    );
  };

  renderInterfaceItem = (item, formInfo, keyInfo) => {
    const { value } = formInfo;
    const { domKey } = keyInfo;
    return (
      <div className={style.edit_form} key={domKey} style={{ height: '200px' }}>
        <InterfaceItem
          field={item}
          defaultValue={value}
          {...formInfo}
          onChange={(v, msg) => this.handleOnChange(v, msg, keyInfo)}
        />
      </div>
    );
  };

  renderAddressItem = (item, formInfo, keyInfo) => {
    const { value } = formInfo;
    const { domKey } = keyInfo;
    return (
      <div className={style.edit_form} key={domKey} style={{ height: '200px' }}>
        <AddressItem
          field={item}
          defaultValue={value}
          {...formInfo}
          onChange={(v, msg) => this.handleOnChange(v, msg, keyInfo)}
        />
      </div>
    );
  };

  renderGridItem = (grid, curValue, keyInfo) => {
    const { fields, key } = grid;
    const forms = fields.map(field => {
      const formInfo = {
        ...{
          key: field.key,
          errorMsg: curValue[field.key].errorMsg,
          value: curValue[field.key].value,
        },
      };
      const newKeyInfo = {
        ...keyInfo,
        childKey: field.key,
        isGrid: true,
        domKey: `${key}${keyInfo.index}${field.key}`,
      };
      return this.renderFormItem(field, formInfo, newKeyInfo);
    });
    return forms;
  };

  renderFormContent = () => {
    const items = this.availableForm.concat(this.availableGrid);
    const newForm = items.map(item => {
      const { formData } = this.state;
      const curValue = formData[item.key];
      if (item.fields) {
        // 如果是列表控件
        return (
          <div key={item.key}>
            <div className={style.grid_name}>{item.name}</div>
            <div>
              {curValue.value.map((itemFormData, i) => {
                const keyInfo = {
                  gridKey: item.key,
                  childKey: itemFormData,
                  index: i,
                };
                const key = `${itemFormData.key}${i}`;
                const content = this.renderGridItem(item, { ...itemFormData }, keyInfo);
                return (
                  <div className={style.grid_content} key={key}>
                    <span onClick={() => this.deleteGridItem(item, curValue, i)} />
                    {content}
                  </div>
                );
              })}
            </div>
            <div className={style.grid_add}>
              <p className={style.btn} onClick={() => this.gridAdd(item, curValue)} />
            </div>
          </div>
        );
      }
      const keyInfo = {
        formKey: item.key,
        domKey: item.key,
      };
      return this.renderFormItem(item, curValue || {}, keyInfo);
    });
    return newForm;
  };

  render() {
    const newForm = this.renderFormContent();
    return (
      <Card bordered={false}>
        {newForm}
        <Button type="primary" onClick={this.handleSubmit}>
          提交
        </Button>
      </Card>
    );
  }
}
export default StartForm;
