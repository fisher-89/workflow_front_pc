import React, { PureComponent } from 'react';
import { Modal, Form } from 'antd';
import Cropper from 'react-cropper';
import { debounce } from 'lodash';
import 'cropperjs/dist/cropper.css';

/* global FileReader */

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 3 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 19 },
  },
};

export default class ModalCropper extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      src: props.cropperFile.url || '',
      cropResult: null,
    };
  }

  componentWillReceiveProps(nextProps) {
    if ('cropperFile' in nextProps && nextProps.cropperFile.url) {
      this.setState({ src: nextProps.cropperFile.url }, debounce(this.cropImage, 100));
    }
  }

  onChange = e => {
    e.preventDefault();
    let files;
    if (e.dataTransfer) {
      ({ files } = e.dataTransfer);
    } else if (e.target) {
      ({ files } = e.target);
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.setState({ src: reader.result });
    };
    reader.readAsDataURL(files[0]);
  };

  cropImage = () => {
    if (!this.cropper || !this.cropper.getCroppedCanvas()) return;
    this.setState({
      cropResult: this.cropper.getCroppedCanvas().toDataURL(),
    });
  };

  handleOk = () => {
    const { cropResult } = this.state;
    const { cropperFile, onChange } = this.props;
    this.cropper.getCroppedCanvas().toBlob(blob => {
      onChange(blob, {
        ...cropperFile,
        url: cropResult,
      });
    });
  };

  render() {
    const { src, cropResult } = this.state;
    const { visible, onCancel, cropperFile, cropperProps } = this.props;
    return (
      <Modal
        width={800}
        title="裁剪"
        destroyOnClose
        visible={visible}
        onOk={this.handleOk}
        onCancel={() => onCancel(cropperFile)}
      >
        <FormItem label="操作" {...formItemLayout}>
          <Cropper
            src={src}
            guides={false}
            dragMode="move"
            {...cropperProps}
            preview=".img-preview"
            crop={debounce(this.cropImage, 500)}
            style={{ height: 400, width: '100%' }}
            ref={cropper => {
              this.cropper = cropper;
            }}
          />
        </FormItem>
        <FormItem label="预览" {...formItemLayout}>
          {cropResult && <img width={180} src={cropResult} alt="cropped" />}
        </FormItem>
      </Modal>
    );
  }
}
ModalCropper.defaultProps = {
  cropperFile: {},
  onChange: () => {},
};
