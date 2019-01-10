import React, { PureComponent } from 'react';
import { connect } from 'dva';
// import FileUpload from '../../FileUpload';
import FileUpload from '../../UploadCropper';
import FormItem from '../FormItem';
import DetailItem from '../DetailItem';

import { dealThumbImg } from '../../../utils/convert';
import { isImage, uniq } from '../../../utils/utils';
import style from './index.less';

@connect()
class UploadItem extends PureComponent {
  constructor(props) {
    super(props);
    const { defaultValue } = props;
    const files = (defaultValue || []).map((its, i) => {
      const file = this.dealFiles(its, i);
      return file;
    });
    this.state = {
      value: files,
      errorMsg: '',
    };
  }

  componentWillReceiveProps(props) {
    const { errorMsg } = props;
    if (errorMsg !== this.props.errorMsg) {
      this.setState({
        errorMsg,
      });
    }
  }

  onChange = (value, deal = true) => {
    const {
      onChange,
      required,
      field: { name },
    } = this.props;
    console.log(value);
    let files = [...value];
    if (deal) {
      files = (value || []).map((its, i) => {
        const file = this.dealFiles(its, i);
        return file;
      });
    } else {
      files = (value || []).map(its => {
        const file = { ...its };
        return file;
      });
    }
    let errorMsg = '';
    if (required && !value.length) {
      errorMsg = `请上传${name}`;
    }
    this.setState(
      {
        value: files,
        errorMsg,
      },
      () => {
        onChange(value, errorMsg);
      }
    );
  };

  dealFiles = (f, i) => {
    let file = '';
    if (f) {
      const isPic = isImage(f);
      if (isPic) {
        file = { url: `${UPLOAD_PATH}${dealThumbImg(f, '_thumb')}`, uid: i };
      } else {
        file = { url: `${UPLOAD_PATH}${f}`, uid: i };
      }
    } else {
      file = { url: '', uid: i };
    }
    return file;
  };

  makeSuffix = validator => {
    let params = [];
    validator.forEach(item => {
      params = [...params, ...item.params.split(',')];
    });
    const unique = uniq(params);
    return unique;
  };

  renderInfo = (value, field, suffix) => (
    <DetailItem {...field}>
      <div className={style.upfile}>
        <FileUpload suffix={suffix} id={`${field.id}`} value={value} disabled />
      </div>
    </DetailItem>
  );

  render() {
    const {
      field,
      field: { validator, max, min },
      required,
      disabled,
      readonly,
    } = this.props;
    const { errorMsg, value } = this.state;
    const suffix = this.makeSuffix(validator);

    if (readonly) {
      return this.renderInfo(value, field, suffix);
    }
    const className = [errorMsg ? style.errorMsg : style.noerror, style.upfile].join(' ');

    return (
      <FormItem
        {...field}
        required={required}
        errorMsg={errorMsg}
        className="file"
        extraStyle={{ height: 'auto', minWidth: '600px' }}
      >
        <div className={className}>
          <FileUpload
            url="/api/files"
            suffix={suffix}
            id={`${field.id}`}
            value={value}
            range={{ max, min }}
            max={10}
            onChange={this.onChange}
            disabled={disabled || readonly}
          />
        </div>
      </FormItem>
    );
  }
}
UploadItem.defaultProps = {
  onChange: () => {},
};
export default UploadItem;
