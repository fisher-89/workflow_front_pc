import React, { PureComponent } from 'react';
import { Form } from 'antd';
import { connect } from 'dva';
import FileUpload from '../../FileUpload';
import FormItem from '../FormItem';
import style from './index.less';

@connect()
class UploadItem extends PureComponent {
  onChange = value => {
    const {
      form: { setFieldsValue },
      feild: { key },
    } = this.props;
    setFieldsValue({ [key]: value });
  };

  render() {
    const {
      feild,
      feild: { key, name },
      required,
      defaultValue,
      form: { getFieldDecorator },
    } = this.props;
    return (
      <FormItem {...feild} width="900px" height="auto" className="file">
        {getFieldDecorator(key, {
          initialValue: defaultValue,
          rules: [{ required, message: `请输入${name}` }],
        })(
          <div className={style.upfile}>
            <FileUpload url="/api/files" defaultValue={defaultValue} onChange={this.onChange} />
          </div>
        )}
      </FormItem>
    );
  }
}

export default UploadItem;
