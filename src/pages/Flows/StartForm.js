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

const typeInt = {
  disabled: true,
  required: true,
  defaultValue: '1.0',
  field: {
    id: 303,
    key: 'number',
    name: '数字',
    description: '',
    type: 'int',
    is_checkbox: 0,
    condition: null,
    region_level: null,
    min: '-100',
    max: '',
    scale: 1,
    default_value: '0',
    width: '300px',
    height: '75px',
    x: 0,
    y: 20,
    line: 1,
    options: [],
    form_id: 20,
    form_grid_id: null,
    sort: 1,
    field_api_configuration_id: null,
    validator_id: [],
    available_options: [],
    validator: [],
    widgets: [],
  },
};
const typeText = {
  disabled: true,
  required: true,
  defaultValue: '哈哈',
  field: {
    id: 317,
    key: 'text',
    name: '文本',
    description: '',
    type: 'text',
    is_checkbox: 0,
    condition: null,
    region_level: null,
    min: '1',
    max: '9',
    scale: 0,
    default_value: '',
    width: '350px',
    height: '75px',
    x: 50,
    y: 10,
    line: 1,
    options: [],
    form_id: 20,
    form_grid_id: null,
    sort: 15,
    field_api_configuration_id: null,
    validator_id: [],
    available_options: [],
    validator: [],
    widgets: [],
  },
};

const typeTextarea = {
  disabled: true,
  required: true,
  defaultValue: '好嗨呀',
  field: {
    id: 317,
    key: 'textarea',
    name: '多行文本',
    description: '',
    type: 'text',
    is_checkbox: 0,
    condition: null,
    region_level: null,
    min: '1',
    max: '9',
    scale: 0,
    default_value: '',
    width: '300px',
    height: '150px',
    x: 50,
    y: 10,
    line: 2,
    options: [],
    form_id: 20,
    form_grid_id: null,
    sort: 15,
    field_api_configuration_id: null,
    validator_id: [],
    available_options: [],
    validator: [],
    widgets: [],
  },
};
const typeAddress = {
  disabled: true,
  defaultValue: { province: 120000 },
  required: true,
  field: {
    id: 304,
    key: 'area',
    name: '地点',
    description: '',
    type: 'region',
    is_checkbox: 0,
    condition: null,
    region_level: 2,
    min: '',
    max: '',
    scale: 0,
    width: '700px',
    height: '75px',
    x: 50,
    y: 10,
    line: 1,
    default_value: [],
    options: [],
    form_id: 20,
    form_grid_id: null,
    sort: 2,
    field_api_configuration_id: null,
    validator_id: [],
    available_options: [],
    validator: [],
    widgets: [],
  },
};
const typeFile = {
  disabled: true,
  defaultValue: ['/storage/uploads/temporary/2018/12/03/120752_20181203154046_822531.jpg'],
  required: true,
  field: {
    id: 302,
    key: 'file',
    name: '文件',
    description: '',
    type: 'file',
    is_checkbox: 0,
    condition: null,
    region_level: null,
    min: '',
    max: '',
    scale: 0,
    default_value: '',
    options: [],
    form_id: 20,
    form_grid_id: null,
    sort: 0,
    field_api_configuration_id: null,
    validator_id: [],
    available_options: [],
    validator: [],
    widgets: [],
  },
};
const typeInterface = {
  disabled: true,
  defaultValue: 1,
  required: true,
  field: {
    id: 314,
    key: 'interface',
    name: '接口（单选）',
    description: '',
    type: 'api',
    is_checkbox: 0,
    condition: null,
    region_level: null,
    min: '',
    max: '',
    scale: 0,
    default_value: '7',
    options: [],
    form_id: 20,
    form_grid_id: null,
    sort: 12,
    field_api_configuration_id: 1,
    validator_id: [],
    available_options: [],
    validator: [],
    widgets: [],
  },
};
const typeInterfaces = {
  disabled: true,

  defaultValue: [1, 4],
  required: true,
  field: {
    id: 315,
    key: 'interfaces',
    name: '接口（多选）',
    description: '',
    type: 'api',
    is_checkbox: 1,
    condition: null,
    region_level: null,
    min: '',
    max: '',
    scale: 0,
    width: '600px',
    default_value: '7',
    options: [],
    form_id: 20,
    form_grid_id: null,
    sort: 12,
    field_api_configuration_id: 1,
    validator_id: [],
    available_options: [],
    validator: [],
    widgets: [],
  },
};
const typeSelect = {
  disabled: true,

  defaultValue: 1,
  required: true,
  field: {
    id: 305,
    key: 'single',
    name: '单选',
    description: '',
    type: 'select',
    is_checkbox: 0,
    condition: null,
    region_level: null,
    min: '',
    max: '',
    scale: 0,
    default_value: '给',
    options: ['给', '我', '发'],
    form_id: 20,
    form_grid_id: null,
    sort: 3,
    field_api_configuration_id: null,
    validator_id: [],
    available_options: [],
    validator: [],
    widgets: [],
  },
};
const typeMutiSelect = {
  disabled: true,

  defaultValue: [1],
  required: true,
  field: {
    id: 306,
    key: 'muti',
    name: '多选',
    description: '',
    type: 'select',
    is_checkbox: 1,
    condition: null,
    region_level: null,
    min: '',
    max: '',
    scale: 0,
    default_value: '给',
    options: ['给', '我', '发'],
    form_id: 20,
    form_grid_id: null,
    sort: 3,
    field_api_configuration_id: null,
    validator_id: [],
    available_options: [],
    validator: [],
    widgets: [],
  },
};
const typeArray = {
  disabled: true,

  defaultValue: ['1'],
  required: true,
  field: {
    id: 307,
    key: 'arra',
    name: '数组',
    description: '',
    type: 'array',
    is_checkbox: 0,
    condition: null,
    region_level: null,
    min: '2',
    max: '15',
    scale: 0,
    width: '700px',
    height: '75px',
    x: 50,
    y: 10,
    line: 1,
    default_value: ['2', '5'],
    options: [],
    form_id: 20,
    form_grid_id: null,
    sort: 5,
    field_api_configuration_id: null,
    validator_id: [],
    available_options: [],
    validator: [],
    widgets: [],
  },
};
const typeDate = {
  disabled: true,

  defaultValue: '',
  required: true,
  field: {
    id: 317,
    key: 'date',
    name: '日期',
    description: '',
    type: 'date',
    is_checkbox: 0,
    condition: null,
    region_level: null,
    min: '2018-08-01',
    max: '',
    scale: 0,
    width: '400px',
    height: '75px',
    default_value: '2018-11-01',
    options: [],
    form_id: 20,
    form_grid_id: null,
    sort: 14,
    field_api_configuration_id: null,
    validator_id: [],
    available_options: [],
    validator: [],
    widgets: [],
  },
};
const typeDateTime = {
  disabled: true,

  defaultValue: '2018-12-01',
  required: true,
  field: {
    id: 318,
    key: 'datetime',
    name: '日期时间',
    description: '',
    type: 'datetime',
    is_checkbox: 0,
    condition: null,
    region_level: null,
    min: '2018-09-01  08:12:12',
    max: '',
    scale: 0,
    width: '400px',
    height: '75px',
    default_value: '2018-11-01',
    options: [],
    form_id: 20,
    form_grid_id: null,
    sort: 14,
    field_api_configuration_id: null,
    validator_id: [],
    available_options: [],
    validator: [],
    widgets: [],
  },
};
const typeTime = {
  disabled: true,
  defaultValue: '12:00:00',
  required: true,
  field: {
    id: 318,
    key: 'time',
    name: '时间',
    description: '',
    type: 'time',
    is_checkbox: 0,
    condition: null,
    region_level: null,
    min: '08:12:12',
    max: '09:45:12',
    scale: 0,
    width: '400px',
    height: '75px',
    default_value: '2018-11-01',
    options: [],
    form_id: 20,
    form_grid_id: null,
    sort: 14,
    field_api_configuration_id: null,
    validator_id: [],
    available_options: [],
    validator: [],
    widgets: [],
  },
};
@connect()
class StartForm extends PureComponent {
  state = {};

  handleSubmit = e => {
    e.preventDefault();
  };

  render() {
    return (
      <Card bordered={false}>
        <div className={style.edit_form} style={{ height: '100px' }}>
          <TextItem {...typeText} />
        </div>
        <div className={style.edit_form} style={{ height: '100px' }}>
          <TextItem {...typeInt} />
        </div>
        <div className={style.edit_form} style={{ height: '200px' }}>
          <TextItem {...typeTextarea} />
        </div>
        <div className={style.edit_form} style={{ height: '200px' }}>
          <AddressItem {...typeAddress} />
        </div>
        <div className={style.edit_form} style={{ height: '200px' }}>
          <UploadItem {...typeFile} />
        </div>
        <div className={style.edit_form} style={{ height: '200px' }}>
          <InterfaceItem {...typeInterface} />
        </div>
        <div className={style.edit_form} style={{ height: '200px' }}>
          <InterfaceItem {...typeInterfaces} />
        </div>
        <div className={style.edit_form} style={{ height: '200px' }}>
          <SelectItem {...typeSelect} />
        </div>
        <div className={style.edit_form} style={{ height: '200px' }}>
          <SelectItem {...typeMutiSelect} />
        </div>
        <div className={style.edit_form} style={{ height: '200px' }}>
          <ArrayItem {...typeArray} />
        </div>
        <div className={style.edit_form} style={{ height: '200px' }}>
          <DateItem {...typeDate} />
        </div>
        <div className={style.edit_form} style={{ height: '200px' }}>
          <DateItem {...typeDateTime} />
        </div>
        <div className={style.edit_form} style={{ height: '200px' }}>
          <TimeItem {...typeTime} />
        </div>
        <Button type="primary" onClick={this.handleSubmit}>
          提交
        </Button>
      </Card>
    );
  }
}
export default StartForm;
