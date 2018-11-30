import React, { PureComponent } from 'react';
import { Card, Form, Button } from 'antd';
import { connect } from 'dva';
// import OAForm
//   from '../../components/OAForm';
import { TextItem, AddressItem } from '../../components/Form/index';
import Address from '../../components/Address';
import style from './index.less';

const typeInt = {
  edit: true,
  required: true,
  defaultValue: '1.0',
  feild: {
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
  edit: true,
  required: true,
  defaultValue: '哈哈',
  feild: {
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
  edit: true,
  required: true,
  defaultValue: '好嗨呀',
  feild: {
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
  defaultValue: { province: 120000 },
  required: true,
  feild: {
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
@Form.create()
@connect()
class StartForm extends PureComponent {
  state = {};

  handleSubmit = e => {
    e.preventDefault();
    console.log('handleSubmit');
    this.props.form.validateFields((err, v) => {
      console.log('v:', v);
    });
  };

  render() {
    const {
      // form: { getFieldDecorator ,setFieldsValue },
      form,
      form: { getFieldDecorator },
    } = this.props;

    return (
      <Card bordered={false}>
        <Form onSubmit={this.handleSubmit}>
          <div className={style.edit_form} style={{ height: '100px' }}>
            <TextItem {...typeInt} form={form} />
          </div>
          <div className={style.edit_form} style={{ height: '100px' }}>
            <TextItem {...typeText} form={form} />
          </div>
          <div className={style.edit_form} style={{ height: '200px' }}>
            <TextItem {...typeTextarea} form={form} />
          </div>
          <div className={style.edit_form} style={{ height: '200px' }}>
            <AddressItem {...typeAddress} form={form} />
          </div>

          <Button type="primary" htmlType="submit">
            提交
          </Button>
        </Form>
      </Card>
    );
  }
}
export default StartForm;
