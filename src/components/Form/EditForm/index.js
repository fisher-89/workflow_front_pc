import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Tooltip } from 'antd';
import {
  TextItem,
  AddressItem,
  UploadItem,
  InterfaceItem,
  SelectItem,
  ArrayItem,
  DateItem,
  TimeItem,
} from '../index';
import style from './index.less';
import styles from '../index.less';

@connect(({ start }) => ({ startDetails: start.startDetails }))
class EditForm extends PureComponent {
  constructor(props) {
    super(props);
    const { startflow, onChange } = props;
    this.dealStartForm(startflow);
    const formData = startflow ? this.initFormData() : {};
    onChange(formData);
    this.state = {
      formData,
      startflow,
    };
  }

  componentWillReceiveProps(props) {
    const { startflow, formData } = props;
    if (startflow && JSON.stringify(startflow) !== JSON.stringify(this.props.startflow)) {
      this.dealStartForm(startflow);
      const newFormData = startflow ? this.initFormData() : {};
      this.setState({
        formData: newFormData,
        startflow,
      });
    }
    if (formData && JSON.stringify(formData) !== JSON.stringify(this.props.formData)) {
      this.setState({
        formData,
      });
    }
  }

  dealStartForm = startflow => {
    if (!startflow) {
      return;
    }
    this.startflow = startflow;
    const availableForm = startflow.fields.form.filter(
      item => startflow.step.available_fields.indexOf(item.key) > -1
    );
    this.availableForm = availableForm.map(item => {
      const newItem = { ...item };
      const disabled = startflow.step.editable_fields.indexOf(item.key) === -1;
      newItem.disabled = disabled;
      newItem.required = startflow.step.required_fields.indexOf(item.key) > -1;
      return newItem;
    });
    const visibleForm = this.availableForm.filter(
      item => startflow.step.hidden_fields.indexOf(item.key) === -1
    );
    this.visibleForm = visibleForm.map(item => {
      const newItem = { ...item };
      const disabled = startflow.step.editable_fields.indexOf(item.key) === -1;
      newItem.disabled = disabled;
      newItem.required = startflow.step.required_fields.indexOf(item.key) > -1;
      return newItem;
    });
    this.availableGrid = startflow.fields.grid.filter(
      item => startflow.step.available_fields.indexOf(item.key) > -1
    );
    this.availableGridItem = this.availableGrid.map(item => {
      const { key, fields } = item;
      const obj = {
        ...item,
        disabled: startflow.step.editable_fields.indexOf(key) === -1,
        required: startflow.step.required_fields.indexOf(key) !== -1,
        availableForm: [],
        availableFields: [],
      };
      const avilable = this.dealGridForm(fields, item, startflow, 1);
      obj.availableForm = [...avilable.forms];
      obj.availableFields = [...avilable.fields];
      const visible = this.dealGridForm(avilable.fields, item, startflow, 2);
      obj.visibleForm = [...visible.forms];
      obj.visibleFields = [...visible.fields];
      return obj;
    });
  };

  dealGridForm = (source, item, startflow, type) => {
    const forms = [];
    const fields = [];
    // const visibleGirdForm = [];
    // const visibleFields = [];
    source.forEach(field => {
      const str = `${item.key}.*.${field.key}`;
      const newField = { ...field };
      if (
        type === 1
          ? startflow.step.available_fields.indexOf(str) > -1
          : startflow.step.hidden_fields.indexOf(str) === -1
      ) {
        forms.push(field.key);

        const disabled = startflow.step.editable_fields.indexOf(str) === -1;
        newField.disabled = disabled;

        const required = startflow.step.required_fields.indexOf(str) > -1;
        newField.required = required;

        fields.push(newField);
      }
    });
    return {
      forms,
      fields,
    };
  };

  initFormData = () => {
    const newForm = this.availableForm.concat(this.availableGridItem);
    const formData = {};
    newForm.forEach(item => {
      const { key, availableFields } = item;
      const obj = {
        key,
        name: item.name,
        errorMsg: '',
        required: item.required,
        disabled: item.disabled,
      };
      const value = this.startflow.form_data[key];
      if (availableFields) {
        const gridValue = value.map(its => {
          const gridformData = {};
          availableFields.forEach(it => {
            const temp = {
              key: it.key,
              name: it.name,
              errorMsg: '',
              value: its[it.key],
              disabled: it.disabled,
              required: it.required,
            };
            gridformData[it.key] = { ...temp };
          });
          return gridformData;
        });
        obj.value = [...gridValue];
        obj.isGrid = true;
      } else {
        obj.value = value;
      }
      formData[key] = { ...obj };
    });
    return formData;
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
    const newGridValue = gridValueInfo.value.map((item, i) => {
      let newItem = { ...item };
      if (i === index) {
        newItem = { ...curGridInfo };
      }
      return newItem;
    });
    const newFormData = {
      ...formData,
      [gridKey]: { ...gridValueInfo, value: newGridValue },
    };

    this.setState(
      {
        formData: {
          ...newFormData,
        },
      },
      () => {
        this.props.onChange(newFormData);
      }
    );
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
    this.setState(
      {
        formData: {
          ...formData,
          [formKey]: newValueInfo,
        },
      },
      () => {
        this.props.onChange(this.state.formData);
      }
    );
  };

  gridAdd = (item, valueInfo) => {
    const { key } = item;
    const { formData } = this.state;
    const defaultValue = item.field_default_value;
    const { availableFields } = item;
    const curValue = {};
    availableFields.forEach(field => {
      const value = defaultValue[field.key];
      curValue[field.key] = {
        value,
        errorMsg: '',
        name: field.name,
        key: field.key,
        required: field.required,
        disabled: field.disabled,
      };
    });

    const newValueInfo = {
      ...valueInfo,
      errorMsg: '',
      value: [...valueInfo.value, curValue],
    };
    this.setState(
      {
        formData: {
          ...formData,
          [key]: newValueInfo,
        },
      },
      () => {
        this.props.onChange(this.state.formData);
      }
    );
  };

  deleteGridItem = (item, valueInfo, index) => {
    const { formData } = this.state;
    const { key, name } = item;
    const gridValueInfo = [...valueInfo.value];
    const newGridValueInfo = gridValueInfo.slice(0, index).concat(gridValueInfo.slice(index + 1));
    let errorMsg = '';
    if (item.required && newGridValueInfo.length === 0) {
      errorMsg = `请添加${name}`;
    }
    const newValueInfo = {
      ...valueInfo,
      errorMsg,
      value: [...newGridValueInfo],
    };
    this.setState(
      {
        formData: {
          ...formData,
          [key]: newValueInfo,
        },
      },
      () => {
        this.props.onChange(this.state.formData);
      }
    );
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
      case 'api':
        return this.renderInterfaceItem(item, formInfo, keyInfo);
      case 'file':
        return this.renderFileItem(item, formInfo, keyInfo);
      case 'region':
        return this.renderAddressItem(item, formInfo, keyInfo);
      default:
        return null;
    }
  };

  renderDateTime = (item, formInfo, keyInfo) => {
    const { value } = formInfo;
    const { domKey } = keyInfo;
    return (
      <div className={style.edit_form} key={domKey}>
        <TimeItem
          field={item}
          defaultValue={value}
          {...formInfo}
          onChange={(v, msg) => this.handleOnChange(v, msg, keyInfo, item)}
        />
      </div>
    );
  };

  renderArray = (item, formInfo, keyInfo) => {
    const { value } = formInfo;
    const { domKey } = keyInfo;

    return (
      <div className={style.edit_form} key={domKey}>
        <ArrayItem
          field={item}
          defaultValue={value}
          {...formInfo}
          onChange={(v, msg) => this.handleOnChange(v, msg, keyInfo, item)}
        />
      </div>
    );
  };

  renderFileItem = (item, formInfo, keyInfo) => {
    const { value } = formInfo;
    const { domKey } = keyInfo;
    return (
      <div className={style.edit_form} key={domKey}>
        <UploadItem
          field={item}
          defaultValue={value}
          {...formInfo}
          onChange={(v, msg) => this.handleOnChange(v, msg, keyInfo, item)}
        />
      </div>
    );
  };

  renderTextItem = (item, formInfo, keyInfo) => {
    const { value } = formInfo;
    const { domKey } = keyInfo;
    return (
      <div className={style.edit_form} key={domKey}>
        <TextItem
          field={item}
          defaultValue={value}
          {...formInfo}
          onChange={(v, msg) => this.handleOnChange(v, msg, keyInfo, item)}
        />
      </div>
    );
  };

  renderDateItem = (item, formInfo, keyInfo) => {
    const { value } = formInfo;
    const { domKey } = keyInfo;
    return (
      <div className={style.edit_form} key={domKey}>
        <DateItem
          field={item}
          defaultValue={value}
          {...formInfo}
          onChange={(v, msg) => this.handleOnChange(v, msg, keyInfo, item)}
        />
      </div>
    );
  };

  renderTimeItem = (item, formInfo, keyInfo) => {
    const { value } = formInfo;
    const { domKey } = keyInfo;
    return (
      <div className={style.edit_form} key={domKey}>
        <TimeItem
          field={item}
          defaultValue={value}
          {...formInfo}
          onChange={(v, msg) => this.handleOnChange(v, msg, keyInfo, item)}
        />
      </div>
    );
  };

  renderSelectItem = (item, formInfo, keyInfo) => {
    const { value } = formInfo;
    const { domKey } = keyInfo;

    return (
      <div className={style.edit_form} key={domKey}>
        <SelectItem
          field={item}
          defaultValue={value}
          {...formInfo}
          onChange={(v, msg) => this.handleOnChange(v, msg, keyInfo, item)}
        />
      </div>
    );
  };

  renderInterfaceItem = (item, formInfo, keyInfo) => {
    const { value } = formInfo;
    const { domKey } = keyInfo;
    return (
      <div className={style.edit_form} key={domKey}>
        <InterfaceItem
          field={item}
          defaultValue={value}
          {...formInfo}
          onChange={(v, msg) => this.handleOnChange(v, msg, keyInfo, item)}
        />
      </div>
    );
  };

  renderAddressItem = (item, formInfo, keyInfo) => {
    const { value } = formInfo;
    const { domKey } = keyInfo;
    return (
      <div className={style.edit_form} key={domKey}>
        <AddressItem
          field={item}
          defaultValue={value}
          {...formInfo}
          onChange={(v, msg) => this.handleOnChange(v, msg, keyInfo, item)}
        />
      </div>
    );
  };

  renderGridItem = (grid, curValue, keyInfo) => {
    const { visibleFields, key, name } = grid;
    const forms = visibleFields.map(field => {
      const formInfo = {
        ...{
          key: field.key,
          errorMsg: curValue[field.key].errorMsg,
          value: curValue[field.key].value,
          required: field.required,
          disabled: field.disabled,
        },
      };

      const newKeyInfo = {
        ...keyInfo,
        childKey: field.key,
        isGrid: true,
        gridName: name,
        domKey: `${key}${keyInfo.index}${field.key}`,
      };
      return this.renderFormItem(field, formInfo, newKeyInfo);
    });

    return forms;
  };

  renderFormContent = () => {
    const items = this.visibleForm.concat(this.availableGridItem);
    const newForm = items.map(item => {
      const { formData } = this.state;
      const curValue = formData[item.key];
      if (item.visibleFields) {
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
            <Tooltip placement="topLeft" title={curValue.errorMsg}>
              <div className={styles.error}>{curValue.errorMsg}</div>
            </Tooltip>
            <div className={style.grid_add}>
              <p className={style.btn} onClick={() => this.gridAdd(item, curValue)} />
            </div>
          </div>
        );
      }
      const keyInfo = {
        formKey: item.key,
        domKey: item.key,
        name: item.name,
      };
      return this.renderFormItem(item, curValue || {}, keyInfo);
    });
    return newForm;
  };

  render() {
    const newForm = this.state.startflow ? this.renderFormContent() : null;
    return <div>{newForm}</div>;
  }
}
EditForm.defaultProps = {
  onChange: () => {},
};
export default EditForm;
