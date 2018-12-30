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
  SelectStaffItem,
  SelectDepItem,
  ShopSelectItem,
} from '../index';
import style from './index.less';

@connect(({ start }) => ({ startDetails: start.startDetails }))
class EditForm extends PureComponent {
  constructor(props) {
    super(props);
    const { startflow } = props;
    this.dealStartForm(startflow);
    const formData = startflow ? this.initFormData() : {};
    this.state = {
      formData,
      startflow,
    };
  }

  componentWillReceiveProps(props) {
    const { startflow } = props;
    if (startflow && JSON.stringify(startflow) !== JSON.stringify(this.props.startflow)) {
      this.dealStartForm(startflow);
      const newFormData = startflow ? this.initFormData() : {};
      this.setState({
        formData: newFormData,
        startflow,
      });
    }
  }

  dealStartForm = startflow => {
    if (!startflow) {
      return;
    }
    this.startflow = startflow;
    this.availableForm = startflow.fields.form.filter(
      item => startflow.step.available_fields.indexOf(item.key) > -1
    );
    this.visibleForm = this.availableForm.filter(
      item => startflow.step.hidden_fields.indexOf(item.key) === -1
    );
    this.availableGrid = startflow.fields.grid.filter(
      item => startflow.step.available_fields.indexOf(item.key) > -1
    );
    this.availableGridItem = this.availableGrid.map(item => {
      const { fields } = item;
      const obj = {
        ...item,
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
    source.forEach(field => {
      const str = `${item.key}.*.${field.key}`;
      const newField = { ...field };
      if (
        type === 1
          ? startflow.step.available_fields.indexOf(str) > -1
          : startflow.step.hidden_fields.indexOf(str) === -1
      ) {
        forms.push(field.key);
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
        readonly: true,
      };
      const value = this.startflow.form_data[key];
      if (availableFields) {
        const gridValue = value.map(its => {
          const gridformData = {};
          availableFields.forEach(it => {
            const temp = {
              key: it.key,
              name: it.name,
              value: its[it.key],
              readonly: true,
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
      case 'staff':
        return this.renderStaffItem(item, formInfo, keyInfo);
      case 'department':
        return this.renderDepartItem(item, formInfo, keyInfo);
      case 'shop':
        return this.renderShopItem(item, formInfo, keyInfo);
      default:
        return null;
    }
  };

  renderDateTime = (item, formInfo, keyInfo) => {
    const { value } = formInfo;
    const { domKey } = keyInfo;
    return (
      <div className={style.edit_form} key={domKey}>
        <TimeItem field={item} defaultValue={value} {...formInfo} />
      </div>
    );
  };

  renderArray = (item, formInfo, keyInfo) => {
    const { value } = formInfo;
    const { domKey } = keyInfo;

    return (
      <div className={style.edit_form} key={domKey}>
        <ArrayItem field={item} defaultValue={value} {...formInfo} />
      </div>
    );
  };

  renderFileItem = (item, formInfo, keyInfo) => {
    const { value } = formInfo;
    const { domKey } = keyInfo;
    return (
      <div className={style.edit_form} key={domKey}>
        <UploadItem field={item} defaultValue={value} {...formInfo} />
      </div>
    );
  };

  renderTextItem = (item, formInfo, keyInfo) => {
    const { value } = formInfo;
    const { domKey } = keyInfo;
    return (
      <div className={style.edit_form} key={domKey}>
        <TextItem field={item} defaultValue={value} {...formInfo} />
      </div>
    );
  };

  renderDateItem = (item, formInfo, keyInfo) => {
    const { value } = formInfo;
    const { domKey } = keyInfo;
    return (
      <div className={style.edit_form} key={domKey}>
        <DateItem field={item} defaultValue={value} {...formInfo} />
      </div>
    );
  };

  renderTimeItem = (item, formInfo, keyInfo) => {
    const { value } = formInfo;
    const { domKey } = keyInfo;
    return (
      <div className={style.edit_form} key={domKey}>
        <TimeItem field={item} defaultValue={value} {...formInfo} />
      </div>
    );
  };

  renderSelectItem = (item, formInfo, keyInfo) => {
    const { value } = formInfo;
    const { domKey } = keyInfo;

    return (
      <div className={style.edit_form} key={domKey}>
        <SelectItem field={item} defaultValue={value} {...formInfo} />
      </div>
    );
  };

  renderInterfaceItem = (item, formInfo, keyInfo) => {
    const { value } = formInfo;
    const { domKey } = keyInfo;
    return (
      <div className={style.edit_form} key={domKey}>
        <InterfaceItem field={item} defaultValue={value} {...formInfo} />
      </div>
    );
  };

  renderAddressItem = (item, formInfo, keyInfo) => {
    const { value } = formInfo;
    const { domKey } = keyInfo;
    return (
      <div className={style.edit_form} key={domKey}>
        <AddressItem field={item} defaultValue={value} {...formInfo} />
      </div>
    );
  };

  renderStaffItem = (item, formInfo, keyInfo) => {
    const { value } = formInfo;
    const { domKey } = keyInfo;
    return (
      <div className={style.edit_form} key={domKey}>
        <SelectStaffItem field={item} defaultValue={value} {...formInfo} />
      </div>
    );
  };

  renderDepartItem = (item, formInfo, keyInfo) => {
    const { value } = formInfo;
    const { domKey } = keyInfo;
    return (
      <div className={style.edit_form} key={domKey}>
        <SelectDepItem field={item} defaultValue={value} {...formInfo} />
      </div>
    );
  };

  renderShopItem = (item, formInfo, keyInfo) => {
    const { value } = formInfo;
    const { domKey } = keyInfo;
    return (
      <div className={style.edit_form} key={domKey}>
        <ShopSelectItem field={item} defaultValue={value} {...formInfo} />
      </div>
    );
  };

  renderGridItem = (grid, curValue, keyInfo) => {
    const { visibleFields, key, name } = grid;
    const forms = visibleFields.map(field => {
      const formInfo = {
        ...{
          key: field.key,
          value: curValue[field.key].value,
          readonly: true,
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
                    {content}
                  </div>
                );
              })}
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
export default EditForm;
