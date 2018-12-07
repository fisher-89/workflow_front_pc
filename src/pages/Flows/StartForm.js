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
  };

  handleText = (value, errorMsg) => {
    console.log(value, errorMsg);
  };

  renderFormItem = (item, formInfo, key) => {
    const { type } = item;
    switch (type) {
      case 'time':
        return this.renderTimeItem(item, formInfo, key);
      case 'datetime':
      case 'date':
        return this.renderDateItem(item, formInfo, key);
      case 'array':
        return this.renderArray(item, formInfo, key);
      case 'text':
      case 'int':
        return this.renderTextItem(item, formInfo, key);
      case 'select':
        return this.renderSelectItem(item, formInfo, key);
      case 'interface':
        return this.renderItemfaceItem(item, formInfo, key);
      case 'file':
        return this.renderFileItem(item, formInfo, key);
      case 'address':
        return this.renderAddressItem(item, formInfo, key);
      default:
        return null;
    }
  };

  renderDateTime = (item, formInfo, key) => {
    const { value } = formInfo;
    return (
      <div className={style.edit_form} style={{ height: '200px' }} key={key}>
        <TimeItem {...item} field={item} defaultValue={value} {...formInfo} />
      </div>
    );
  };

  renderArray = (item, formInfo, key) => {
    const { value } = formInfo;
    return (
      <div className={style.edit_form} key={key} style={{ height: '200px' }}>
        <ArrayItem field={item} defaultValue={value} {...formInfo} />
      </div>
    );
  };

  renderFileItem = (item, formInfo, key) => {
    const { value } = formInfo;
    return (
      <div className={style.edit_form} key={key} style={{ height: '200px' }}>
        <UploadItem field={item} defaultValue={value} {...formInfo} />
      </div>
    );
  };

  renderTextItem = (item, formInfo, key) => {
    const { value } = formInfo;
    return (
      <div className={style.edit_form} key={key} style={{ height: '200px' }}>
        <TextItem field={item} defaultValue={value} {...formInfo} />
      </div>
    );
  };

  renderDateItem = (item, formInfo, key) => {
    const { value } = formInfo;
    return (
      <div className={style.edit_form} key={key} style={{ height: '200px' }}>
        <DateItem field={item} defaultValue={value} {...formInfo} />
      </div>
    );
  };

  renderTimeItem = (item, formInfo, key) => {
    const { value } = formInfo;
    return (
      <div className={style.edit_form} key={key} style={{ height: '200px' }}>
        <TimeItem field={item} defaultValue={value} {...formInfo} />
      </div>
    );
  };

  renderSelectItem = (item, formInfo, key) => {
    const { value } = formInfo;
    return (
      <div className={style.edit_form} key={key} style={{ height: '200px' }}>
        <SelectItem field={item} defaultValue={value} {...formInfo} />
      </div>
    );
  };

  renderInterfaceItem = (item, formInfo, key) => {
    const { value } = formInfo;
    return (
      <div className={style.edit_form} key={key} style={{ height: '200px' }}>
        <InterfaceItem field={item} defaultValue={value} {...formInfo} />
      </div>
    );
  };

  renderAddressItem = (item, formInfo, key) => {
    const { value } = formInfo;
    return (
      <div className={style.edit_form} key={key} style={{ height: '200px' }}>
        <AddressItem field={item} defaultValue={value} {...formInfo} />
      </div>
    );
  };

  renderGridItem = (grid, curValue) => {
    const { fields, key } = grid;
    const forms = fields.map(field => {
      const formInfo = {
        ...{
          key: field.key,
          errorMsg: curValue[field.key].errorMsg,
          value: curValue[field.key].value,
        },
      };
      const newKey = `${key}_${field.key}`;
      return this.renderFormItem(field, formInfo, newKey);
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
              {curValue.value.map((itemFormData, index) => {
                const content = this.renderGridItem(item, { ...itemFormData }, i);
                return (
                  <div className={style.grid_content} key={itemFormData.key}>
                    <span />
                    {content}
                  </div>
                );
              })}
            </div>
            <div className={style.grid_add}>
              <p className={style.btn} />
            </div>
          </div>
        );
      }
      return this.renderFormItem(item, curValue || {}, item.key);
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
