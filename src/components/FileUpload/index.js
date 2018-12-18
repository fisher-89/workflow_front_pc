import React, { PureComponent } from 'react';
import { Upload, Icon, Modal, notification, Spin } from 'antd';
import { connect } from 'dva';
import classNames from 'classnames';
import request from '../../utils/request';
import { rebackImg, reAgainImg } from '../../utils/convert';
import { isImage } from '../../utils/utils';

import style from './index.less';

@connect(({ loading }) => ({ loading }))
class FileUpload extends PureComponent {
  constructor(props) {
    super(props);
    const { value } = props;
    this.state = {
      fileList: value || [],
      previewVisible: false,
    };
    this.validate = true;
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
    if (this.validate) {
      const { onChange } = this.props;
      const { fileList } = info;
      this.setState({ fileList }, () => {
        // const newImgs = newFileList.map(its => rebackImg(its.url, `${UPLOAD_PATH}`, '_thumb'));
        onChange(fileList, false);
      });
    }
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

  onError = (uid, error) => {
    if (error) {
      const { errors } = error;
      const msgs = errors[Object.keys(errors)[0]];
      notification.open({
        message: '错误提示',
        description: `请上传${msgs.join(',')}格式的文件`,
      });
    }
    const { onChange } = this.props;
    const { fileList } = this.state;
    const newFileList = fileList.filter(item => item.uid !== uid);
    this.setState(
      {
        fileList: newFileList,
      },
      () => {
        if (onChange) {
          onChange(newFileList, false);
        }
      }
    );
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
    const { url, id } = this.props;
    const formData = new FormData();
    formData.append('upFile', options.file);
    formData.append('field_id', id);
    request(url, {
      method: 'POST',
      body: formData,
    })
      .then(res => {
        if (res.status === 422) {
          this.onError(options.file.uid, res);
        } else {
          this.onSuccess(res, options.file.uid);
        }
      })
      .catch(error => {
        this.onError(error, options.file.uid);
      });
  };

  beforeUpload = file => {
    const { name } = file;
    const { suffix } = this.props;
    const index = name.lastIndexOf('.');
    const suffi = name.slice(index + 1);
    this.validate = false;
    if ((suffix.length && suffix.indexOf(suffi) !== -1) || !suffix.length) {
      this.validate = true;
      return true;
    }
    notification.open({
      message: '错误提示',
      description: `请上传${suffix.join(',')}格式的文件`,
    });
    return false;
  };

  render() {
    const { fileList, previewVisible, previewSrc } = this.state;
    const { disabled, loading, url } = this.props;
    const uploadButton = disabled ? null : (
      <div>
        <Icon type="plus" />
        <div className={style.ant_upload_text}>上传</div>
      </div>
    );
    const className = classNames(style.upload, {
      [style.disabled]: disabled,
    });
    const fileLoading = loading.effects[url];

    return (
      <div style={{ position: 'relative' }} className={className}>
        <Spin spinning={fileLoading || false}>
          <Upload
            {...this.props}
            listType="picture-card"
            fileList={fileList}
            onSuccess={this.onSuccess}
            onPreview={this.handlePreview}
            customRequest={this.customRequest}
            // beforeUpload={this.beforeUpload}
            onChange={this.handleChange}
            disabled={disabled}
          >
            {uploadButton}
          </Upload>
        </Spin>
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
  listType: 'picture-card',
  suffix: [],
};
export default FileUpload;
