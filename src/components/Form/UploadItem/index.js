import React, { PureComponent } from 'react';
import { connect } from 'dva';
import FileUpload from '../../FileUpload';
import FormItem from '../FormItem';
import { dealThumbImg } from '../../../utils/convert';

import style from './index.less';

@connect()
class UploadItem extends PureComponent {
  onChange = value => {
    const {
      form: { setFieldsValue },
      field: { key },
    } = this.props;
    setFieldsValue({ [key]: value });
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
    const files = (defaultValue || []).map((its, i) => {
      const file = { url: `${UPLOAD_PATH}${dealThumbImg(its, '_thumb')}`, uid: i };
      return file;
    });
    return (
      <FormItem {...field} width="900px" height="auto" className="file">
        {getFieldDecorator(key, {
          initialValue: files,
          rules: [
            { required, message: `请上传${name}` },
            {
              validator: this.validateFile,
            },
          ],
        })(
          <div className={style.upfile}>
            <FileUpload url="/api/files" defaultValue={files} onChange={this.onChange} />
          </div>
        )}
      </FormItem>
    );
  }
}

export default UploadItem;
