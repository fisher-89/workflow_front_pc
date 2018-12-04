import React, { PureComponent } from 'react';
import { connect } from 'dva';
import FormItem from '../FormItem';
import SingleSelect from '../../SingleSelect';
import style from './index.less';

@connect(({ interfaceApi }) => ({ sourceDetails: interfaceApi.sourceDetails }))
class UploadItem extends PureComponent {
  componentWillMount() {
    const { dispatch, field } = this.props;
    this.id = field.field_api_configuration_id;
    dispatch({
      type: 'interfaceApi/fetchApi',
      payload: {
        id: this.id,
      },
    });
  }

  onChange = value => {
    const {
      form: { setFieldsValue },
      field: { key },
    } = this.props;
    setFieldsValue({ [key]: value });
  };

  getOptions = () => {
    const { sourceDetails } = this.props;
    return sourceDetails[this.id] || [];
  };

  validateFile = (rule, value, callback) => {
    const { required } = this.props;
    if (required && (!value || value.length === 0)) {
      callback();
    } else callback();
  };

  render() {
    const {
      field,
      field: { key, name },
      required,
      defaultValue,
      form: { getFieldDecorator },
    } = this.props;
    const options = this.getOptions();
    if (!field.is_checkbox) {
      return (
        <FormItem {...field}>
          <div className={style.inteface}>
            {getFieldDecorator(key, {
              initialValue: defaultValue,
              rules: [{ required, message: `请选择${name}` }],
            })(<SingleSelect options={options} />)}
          </div>
        </FormItem>
      );
    }
    return (
      <FormItem {...field} height="auto">
        <div className={style.mutiinteface}>
          {getFieldDecorator(key, {
            initialValue: defaultValue,
            rules: [{ required, message: `请选择${name}` }],
          })(<SingleSelect options={options} mode="multiple" />)}
        </div>
      </FormItem>
    );
  }
}

export default UploadItem;
