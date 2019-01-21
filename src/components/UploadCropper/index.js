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

    this.setState({ ...uploadState, fileList, value: newValue }, () => {
      const newImgs = newValue.map(its => {
        let img = its.url;
        const isPic = isImage(img);
        if (isPic) {
          img = rebackImg(its.url, `${UPLOAD_PATH}`, '_thumb');
        } else {
          img = rebackImg(img, `${UPLOAD_PATH}`, '.');
        }
        return img;
      });
      if (file.status === 'removed') onChange(newImgs);
    });
  };

  handleCancel = () => {
    this.setState({
      previewImage: '',
      previewVisible: false,
    });
  };

  // handlePreview = file => {
  //   this.setState({
  //     previewImage: file.url || file.thumbUrl,
  //     previewVisible: true,
  //   });
  // };

  handlePreview = file => {
    const previewSrc = file.url || file.thumbUrl;

    if (previewSrc) {
      const isPic = isImage(previewSrc);

      if (!isPic) {
        const f = rebackImg(previewSrc, `${UPLOAD_PATH}`, '.');
        const a = document.createElement('a');
        a.href = f;
        a.download = f;
        a.target = '_blank';
        a.click();
      } else {
        const bigImgs = file.status === 'done' ? reAgainImg(previewSrc, '_thumb') : previewSrc;
        this.setState({
          previewVisible: true,
          previewImage: bigImgs,
        });
      }
    }
  };

  beforeUpload = file => {
    const { disabled } = this.props;
    if (disabled) return;
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
    const { url, id } = this.props;
    const formData = new FormData();
    formData.append('upFile', file.file);
    formData.append('field_id', id);
    request(url, {
      method: 'POST',
      body: formData,
    })
      .then(res => {
        if (res.status === 422) {
          const { errors } = res;
          const msgs = errors[Object.keys(errors)[0]].join(';');
          this.afterCallBack(msgs, 'error', file.file);
        } else {
          this.afterCallBack(res, 'done', file.file);
        }
      })
      .catch(error => {
        this.afterCallBack(error, 'error', file.file);
      });
  };

  afterCallBack = (response, status = 'done', file) => {
    const { value, fileList } = this.state;
    const { onChange } = this.props;
    const newFileList = fileList
      .map(item => {
        if (item.uid === file.uid) {
          return {
            ...item,
            status,
            url: status === 'done' ? response.thumb_url || response.url : null,
          };
        }
        return item;
      })
      .filter(item => item.status !== 'error');
    if (status === 'done') {
      value.push({
        ...file,
        url: response.thumb_url || response.url,
      });
    }
    if (status === 'error') message.error(`上传失败：${response}`);
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
    const { fileList, visible, cropperSrc, previewVisible, previewImage, value } = this.state;
    const { cropperProps, max, placeholder, cropper, disabled, readonly } = this.props;
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
      readonly || fileList.length >= (max || 10) ? null : (
        <div>
          <div className={style.ant_upload_text}> 拖拽文件或点击上传 </div>{' '}
        </div>
      );

    const className = classNames(style.upload, {
      [style.disabled]: disabled || readonly,
    });

    return (
      <div
        style={{ position: 'relative' }}
        className={className}
        ref={ref => {
          this.ref = ref;
        }}
        id={`upload${this.props.id}`}
      >
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
          {uploadButton}
        </Upload>
        <Modal
          visible={previewVisible}
          footer={null}
          onCancel={this.handleCancel}
          getContainer={() => document.getElementById(`upload${this.props.id}`)}
        >
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
