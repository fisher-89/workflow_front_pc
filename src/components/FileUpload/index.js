import React, { PureComponent } from 'react';
import { Upload, Icon, Modal } from 'antd';
import { connect } from 'dva';
import request from '../../utils/request';
import { rebackImg, reAgainImg, dealThumbImg } from '../../utils/convert';

import style from './index.less';

@connect()
class FileUpload extends PureComponent {
  constructor(props) {
    super(props);
    const { defaultValue } = props;
    this.state = {
      fileList: defaultValue,
      previewVisible: false,
    };
  }

  componentWillReceiveProps(props) {
    const { value } = props;
    if (JSON.stringify(value) !== JSON.stringify(this.props.value)) {
      this.state = {
        fileList: value,
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

  isImage = src => {
    let imgtype = '';
    if (src.indexOf('.') > 0) {
      // 如果包含有"/"号 从最后一个"/"号+1的位置开始截取字符串
      imgtype = src.substring(src.lastIndexOf('.') + 1, src.length);
    }
    imgtype = imgtype.toLowerCase();
    if (
      imgtype === 'png' ||
      imgtype === 'jpeg' ||
      imgtype === 'bmp' ||
      imgtype === 'jpg' ||
      imgtype === 'gif'
    ) {
      return true;
    }
    return false;
  };

  handleChange = info => {
    const { fileList } = info;
    this.setState({ fileList });
  };

  onSuccess = (res, uid) => {
    const { onChange } = this.props;
    const { fileList } = this.state;
    const file = res.thumb_url;
    const newFileList = fileList.map(item => {
      const upFile = { ...item };
      if (item.uid === uid) {
        upFile.status = 'success';
        upFile.url = file;
      }
      return upFile;
    });
    this.setState({ fileList: newFileList }, () => {
      if (onChange) {
        const newImgs = newFileList.map(its => rebackImg(its.url, `${UPLOAD_PATH}`, '_thumb'));
        onChange(newImgs);
      }
    });
  };

  handlePreview = file => {
    const previewSrc = file.url;
    const isPic = this.isImage(previewSrc);
    if (!isPic) {
      window.open(previewSrc);
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

export default FileUpload;
