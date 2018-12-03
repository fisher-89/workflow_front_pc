import React, { PureComponent } from 'react';
import { Upload, Icon } from 'antd';
import { connect } from 'dva';
import request from '../../utils/request';
import style from './index.less';

@connect()
class FileUpload extends PureComponent {
  constructor(props) {
    super(props);
    const { defaultValue } = props;
    const newValue = this.combineValue(defaultValue);
    this.state = {
      fileList: newValue,
    };
  }

  componentWillReceiveProps(props) {
    const { value } = props;
    if (JSON.stringify(value) !== JSON.stringify(this.props.value)) {
      const newValue = this.combineValue(value);
      this.state = {
        fileList: newValue,
      };
    }
  }

  combineValue = value => {
    const newValue = (value || []).map((url, i) => {
      const file = { url, uid: i };
      return file;
    });
    return newValue;
  };

  handleChange = info => {
    const { fileList } = info;
    this.setState({ fileList });
  };

  onSuccess = res => {
    const { onChange } = this.props;
    const { fileList } = this.state;
    const file = res.thumb_url;
    const [lastFile] = fileList.slice(-1);
    if (lastFile) {
      lastFile.status = 'success';
      lastFile.url = file;
    }
    const newFileList = [...fileList.slice(0, -1)].concat(lastFile || []);
    this.setState(
      {
        fileList: newFileList,
      },
      () => {
        if (onChange) {
          onChange(newFileList.map(item => item.url));
        }
      }
    );
  };

  customRequest = options => {
    const { url } = this.props;
    const formData = new FormData();
    formData.append('upFile', options.file);
    formData.append('field_id', 302);
    request(url, {
      method: 'POST',
      body: formData,
    })
      .then(res => {
        this.onSuccess(res);
      })
      .catch(error => {});
  };

  render() {
    const { fileList } = this.state;
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className={style.ant_upload_text}>上传</div>
      </div>
    );
    return (
      <div style={{ position: 'relative' }}>
        <Upload
          listType="picture-card"
          fileList={fileList}
          onSuccess={this.onSuccess}
          onPreview={this.handlePreview}
          customRequest={this.customRequest}
          onChange={this.handleChange}
        >
          {uploadButton}
        </Upload>
      </div>
    );
  }
}

export default FileUpload;
