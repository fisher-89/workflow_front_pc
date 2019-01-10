import React from 'react';
import { Upload, message, Icon, Modal } from 'antd';
import moment from 'moment';
import { connect } from 'dva';
import classNames from 'classnames';

import request from '../../utils/request';
import { isImage } from '../../utils/utils';
import { rebackImg, reAgainImg } from '../../utils/convert';

import style from './index.less';

// import ModalCropper from './ModalCropper';

@connect()
class UploadCropper extends React.Component {
  constructor(props) {
    super(props);
    const { value, fileList } = this.makeUploadListValue(props.value || []);
    this.state = {
      value,
      fileList,
      fileItem: {},
      visible: false,
      cropperSrc: {},
      previewImage: '',
      previewVisible: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps && nextProps.value.length && !this.state.value.length) {
      const { value, fileList } = this.makeUploadListValue(nextProps.value);
      this.setState({ value, fileList });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (JSON.stringify(nextState) !== JSON.stringify(this.state)) {
      return true;
    }
    if (JSON.stringify(nextProps.disabled) !== JSON.stringify(this.props.disabled)) {
      return true;
    }
    if (JSON.stringify(nextProps.value) === JSON.stringify(this.props.value)) {
      return false;
    }
    return true;
  }

  makeUploadListValue = files => {
    const params = [...files];
    const fileList = [];
    params.forEach((item, index) => {
      if (item) {
        const uid = `${moment().unix()}${index + 1}`;
        fileList.push({
          uid,
          name: uid,
          status: 'done',
          url: item,
        });
      }
    });
    return { fileList, value: fileList };
  };

  handleChange = ({ file, fileList }) => {
    console.log('change');
    const { max, onChange, cropper } = this.props;
    if (fileList.length > max) {
      message.error('上传数量已经达到最大限制!!');
      return;
    }
    const { value } = this.state;
    let newValue = [...value];
    if (file.status === 'removed') {
      newValue = value.filter(item => item.uid !== file.uid);
    }
    const uploadState = { fileList, value: newValue };
    if (!cropper) uploadState.fileItem = file;

    this.setState({ ...uploadState }, () => {
      if (file.status === 'removed') onChange(newValue.map(item => item.url));
    });
  };

  handleCancel = () => {
    this.setState({
      previewImage: '',
      previewVisible: false,
    });
  };

  handlePreview = file => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  };

  beforeUpload = file => {
    const fr = new FileReader();
    fr.readAsDataURL(file);
    fr.onload = () => {
      const fileType = {
        name: file.name,
        type: file.type,
        uid: file.uid,
        webkitRelativePath: file.webkitRelativePath,
      };
      this.setState({
        visible: true,
        cropperSrc: {
          ...fileType,
          status: 'uploading',
          url: fr.result,
        },
      });
    };
    return true;
  };

  cropperChange = (blob, file) => {
    const { fileList } = this.state;
    const newFileList = fileList.map(item => {
      if (item.uid === file.uid) {
        return file;
      }
      return item;
    });
    this.setState(
      {
        visible: false,
        cropperSrc: {},
        fileItem: file,
        fileList: [...newFileList],
      },
      () => this.customRequest(blob)
    );
  };

  cropperCancel = file => {
    const { fileList } = this.state;
    const blob = fileList.find(item => item.uid === file.uid).originFileObj;
    this.setState({ visible: false, cropperSrc: {}, fileItem: file }, () =>
      this.customRequest(blob)
    );
  };

  customRequest = file => {
    console.log('customRequest');
    const { fileItem } = this.state;
    // if (!fileItem) return;
    const { url, id } = this.props;
    const formData = new FormData();
    formData.append('upFile', file.file);
    formData.append('field_id', id);
    request(url, {
      method: 'POST',
      body: formData,
    }).then(res => {
      this.afterCallBack(res, 'done');
    });
    // .catch(error => {
    //   this.afterCallBack(res.url, 'error');
    // });
  };

  afterCallBack = (response, status = 'done') => {
    const { fileItem, value, fileList } = this.state;
    const { name, onChange } = this.props;
    const newFileList = fileList.map(item => {
      if (item.uid === fileItem.uid) {
        return {
          ...item,
          status,
        };
      }
      return item;
    });
    if (status === 'done') {
      value.push({
        ...fileItem,
        url: response.thumb_url || response.url,
      });
    }
    if (status === 'error') message.error(`上传失败：${response[name]}`);
    this.setState({ value, fileList: newFileList, fileItem: null }, () => {
      if (status === 'done') {
        // const params = value.map(item => item.url);
        const newImgs = value.map(its => {
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
        // onChange(params);
      }
    });
  };

  render() {
    const { fileList, visible, cropperSrc, previewVisible, previewImage } = this.state;
    const { cropperProps, max, placeholder, cropper, disabled } = this.props;

    const disableUploadStyle = {
      width: '104px',
      height: '104px',
      position: 'absolute',
      top: 0,
      cursor: 'not-allowed',
      backgroundColor: 'rgba(100,100,100,0.1)',
      zIndex: 1000,
    };
    const uploadButton =
      disabled || fileList.length >= (max || 10) ? null : (
        <div>
          <Icon type="plus" />
          <div className={style.ant_upload_text}> 上传 </div>{' '}
        </div>
      );
    const className = classNames(style.upload, {
      [style.disabled]: disabled,
    });
    return (
      <div style={{ position: 'relative' }} className={className}>
        {disabled && <div style={disableUploadStyle} />}{' '}
        <Upload
          fileList={fileList}
          listType="picture-card"
          disabled={disabled}
          customRequest={file => {
            if (!cropper) this.customRequest(file);
          }}
          onChange={this.handleChange}
          onPreview={this.handlePreview}
          beforeUpload={this.beforeUpload}
        >
          {uploadButton}{' '}
        </Upload>{' '}
        <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
          <img alt="example" style={{ width: '100%' }} src={previewImage} />{' '}
        </Modal>
      </div>
    );
  }
}
UploadCropper.defaultProps = {
  max: '',
  name: 'file',
  cropper: false,
  actionType: '',
  cropperProps: {},
  disabled: false,
  onChange: () => {},
};

export default UploadCropper;
