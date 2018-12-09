import React, { PureComponent } from 'react';
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
} from '../index';
import style from './index.less';

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
    const { startflow } = props;
    if (startflow && JSON.stringify(startflow) !== JSON.stringify(this.props.startflow)) {
      this.dealStartForm(startflow);
      const formData = startflow ? this.initFormData() : {};
      this.setState({
        formData,
        startflow,
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
      const availableGridForm = [];
      const availableFields = [];
      const visibleGirdForm = [];
      const visibleFields = [];
      fields.forEach(field => {
        const str = `${key}.*.${field.key}`;
        if (startflow.step.available_fields.indexOf(str) > -1) {
          availableGridForm.push(field.key);
          availableFields.push(field);
        }
      });
      availableFields.forEach(field => {
        const str = `${key}.*.${field.key}`;
        const newField = { ...field };
        if (startflow.step.hidden_fields.indexOf(str) === -1) {
          visibleGirdForm.push(field.key);
          const disabled = startflow.step.editable_fields.indexOf(str) === -1;
          newField.disabled = disabled;
          const required = startflow.step.required_fields.indexOf(str) > -1;
          newField.required = required;
          visibleFields.push(newField);
        }
      });
      obj.availableForm = [...availableGridForm];
      obj.availableFields = [...availableFields];
      obj.visibleForm = [...visibleGirdForm];
      obj.visibleFields = [...visibleFields];
      return obj;
    });
  };

  initFormData = () => {
    const newForm = this.availableForm.concat(this.availableGridItem);
    const formData = {};
    newForm.forEach(item => {
      const { key, availableFields } = item;
      const obj = {
        key,
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
              errorMsg: '',
              value: its[it.key],
              disabled: its[it.disabled],
              required: its[it.required],
            };
            gridformData[it.key] = { ...temp };
          });
          return gridformData;
        });
        obj.value = [...gridValue];
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
    gridValueInfo.value[index] = { ...curGridInfo };
    this.setState(
      {
        formData: {
          ...formData,
          [gridKey]: gridValueInfo,
        },
      },
      () => {
        this.props.onChange(this.state.formData);
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
        key: field.key,
      };
    });
    const newValueInfo = {
      ...valueInfo,
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
    const { key } = item;
    const gridValueInfo = [...valueInfo.value];
    const newGridValueInfo = gridValueInfo.slice(0, index).concat(gridValueInfo.slice(index + 1));
    const newValueInfo = {
      ...valueInfo,
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
        <TimeItem field={item} defaultValue={value} {...formInfo} onChange={this.handleOnChange} />
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
          onChange={(v, msg) => this.handleOnChange(v, msg, keyInfo)}
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
          onChange={(v, msg) => this.handleOnChange(v, msg, keyInfo)}
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
          onChange={(v, msg) => this.handleOnChange(v, msg, keyInfo)}
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
          onChange={(v, msg) => this.handleOnChange(v, msg, keyInfo)}
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
          onChange={(v, msg) => this.handleOnChange(v, msg, keyInfo)}
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
          onChange={(v, msg) => this.handleOnChange(v, msg, keyInfo)}
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
          onChange={(v, msg) => this.handleOnChange(v, msg, keyInfo)}
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
          onChange={(v, msg) => this.handleOnChange(v, msg, keyInfo)}
        />
      </div>
    );
  };

  renderGridItem = (grid, curValue, keyInfo) => {
    const { visibleFields, key } = grid;
    const forms = visibleFields.map(field => {
      const formInfo = {
        ...{
          key: field.key,
          errorMsg: curValue[field.key].errorMsg,
          value: curValue[field.key].value,
          required: curValue[field.key].required,
          disabled: curValue[field.key].disabled,
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
    const newForm = this.state.startflow ? this.renderFormContent() : null;
    return <div>{newForm}</div>;
  }
}
EditForm.defaultProps = {
  onChange: () => {},
};
export default EditForm;
