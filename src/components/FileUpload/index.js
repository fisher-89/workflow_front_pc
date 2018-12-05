import React, { PureComponent } from 'react';
import { Upload, Icon, Modal } from 'antd';
import { connect } from 'dva';
import request from '../../utils/request';
import { rebackImg, reAgainImg, dealThumbImg } from '../../utils/convert';
import { isImage } from '../../utils/utils';

import style from './index.less';

@connect()
class FileUpload extends PureComponent {
  constructor(props) {
    super(props);
    const { value } = props;
    this.state = {
      fileList: value || [],
      previewVisible: false,
    };
  }

  componentWillReceiveProps(props) {
    const { value } = props;
    if (JSON.stringify(value) !== JSON.stringify(this.props.value)) {
      this.setState({
        fileList: value,
      });
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
    const { onChange } = this.props;
    const { fileList } = info;
    this.setState({ fileList }, () => {
      // const newImgs = newFileList.map(its => rebackImg(its.url, `${UPLOAD_PATH}`, '_thumb'));
      onChange(fileList, false);
    });
  };

  onSuccess = (res, uid) => {
    const { onChange } = this.props;
    const { fileList } = this.state;
    const newFileList = fileList.map(item => {
      const upFile = { ...item };
      if (item.uid === uid) {
        upFile.status = 'success';
        if (isImage(res.path)) {
          upFile.url = res.thumb_url;
        } else {
          upFile.url = res.url;
        }
      }
      return upFile;
    });
    this.setState({ fileList: newFileList }, () => {
      if (onChange) {
        const newImgs = newFileList.map(its => {
          let img = its.url;
          const isPic = isImage(img);
          if (isPic) {
            img = rebackImg(its.url, `${UPLOAD_PATH}`, '_thumb');
          } else {
            img = rebackImg(img, `${UPLOAD_PATH}`, '.');
          }
          return img;
        });
        onChange(newImgs);
      }
    });
  };

  handlePreview = file => {
    const previewSrc = file.url;
    const isPic = isImage(previewSrc);
    if (!isPic) {
      const a = document.createElement('a');
      a.href = previewSrc;
      a.download = '';
      a.target = '_blank';
      a.click();
    } else {
      const bigImgs = reAgainImg(previewSrc, '_thumb');
      this.setState({
        previewVisible: true,
        previewSrc: bigImgs,
      });
    }
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
        this.onSuccess(res, options.file.uid);
      })
      .catch(error => {});
  };

  render() {
    const { fileList, previewVisible, previewSrc } = this.state;
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
        <Modal
          visible={previewVisible}
          footer={null}
          onCancel={() => {
            this.setState({ previewVisible: false });
          }}
        >
          <img alt="example" style={{ width: '100%' }} src={previewSrc} />
        </Modal>
      </div>
    );
  }
}
FileUpload.defaultProps = {
  onChange: () => {},
};
export default FileUpload;
