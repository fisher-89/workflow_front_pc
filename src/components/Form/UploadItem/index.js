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
    const { errorMsg, value } = props;
    if (
      errorMsg !== this.props.errorMsg ||
      JSON.stringify(value) !== JSON.stringify(this.props.value)
    ) {
      this.setState({
        errorMsg,
        value: value.map(its => this.dealFiles(its)),
      });
    }
  }

  onChange = (value, deal = true) => {
    const {
      onChange,
      required,
      field: { name },
    } = this.props;
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

  dealFiles = f => {
    let file = '';
    if (f) {
      const isPic = isImage(f);
      if (isPic) {
        // file = { url: `${UPLOAD_PATH}${dealThumbImg(f, '_thumb')}`, uid: i };
        file = `${UPLOAD_PATH}${dealThumbImg(f, '_thumb')}`;
      } else {
        // file = { url: `${UPLOAD_PATH}${f}`, uid: i };
        file = `${UPLOAD_PATH}${f}`;
      }
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

  renderInfo = (value, { field, template }, suffix) => (
    <DetailItem
      {...field}
      template={template}
      tooltip={false}
      extraStyle={template ? { overflowY: 'scroll' } : {}}
      rightStyle={{ backgroundColor: 'rgba(153, 153, 153, 0.05)' }}
    >
      <div className={style.filelist}>
        {value && value.length ? (
          <FileUpload suffix={suffix} id={`${field.id}`} value={value} readonly />
        ) : null}
      </div>
    </DetailItem>
  );

  render() {
    const {
      field,
      field: { validator, max, min },
      required,
      disabled,
      template,
      ratio: { xRatio, yRatio },
      readonly,
    } = this.props;
    const { errorMsg, value } = this.state;
    const suffix = this.makeSuffix(validator);

    if (readonly) {
      return this.renderInfo(value, this.props, suffix);
    }
    const className = [errorMsg ? style.errorMsg : style.noerror, style.upfile].join(' ');
    return (
      <FormItem
        {...field}
        required={required}
        errorMsg={errorMsg}
        disabled={disabled}
        className="file"
        template={template}
        extraStyle={!template ? { minWidth: `${10 * xRatio}px`, minHeight: `${2 * yRatio}px` } : {}}
        rightStyle={{ padding: '5px 0 0 0px' }}
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
            disabled={disabled}
            readonly={readonly}
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
