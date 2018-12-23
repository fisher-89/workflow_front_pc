import React from 'react';
import { Upload, Button, message } from 'antd';
import ImportResult from '../importResult';

export default class UploadExcel extends Upload {
  state = {
    fileList: [],
    importResult: {
      visible: false,
      error: false,
      response: {},
    },
  };

  uploadFileResult = ({ response }) => {
    let result = {};
    const { onError, onSuccess } = this.props;
    if (Object.keys(response.errors).length) {
      onError(response);
      result = {
        visible: true,
        error: true,
        response,
      };
    } else {
      result = {
        visible: true,
        error: false,
        response,
      };
    }
    this.setState({ importResult: { ...result } }, () => {
      if (!result.error) {
        onSuccess(response);
      } else {
        onError(response);
      }
    });
  };

  handleChange = info => {
    let { fileList } = info;
    if (info.file.status === 'done') {
      this.props.afterChange(info.file.response);
      this.uploadFileResult(info.file);
    }
    fileList = fileList.slice(-1);
    fileList = fileList.map(file => {
      const newFile = file;
      if (file.response) {
        newFile.url = file.response.url;
      }
      return newFile;
    });

    fileList = fileList.filter(file => {
      if (file.response) {
        return file.response.status === 'success';
      }
      return true;
    });
    this.setState({ fileList });
  };

  handleBeforeUpload = file => {
    const isExcel =
      file.type === 'application/vnd.ms-excel' ||
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    if (!isExcel) {
      message.error('你只能上传excel格式的文件!');
    }
    return isExcel;
  };

  render() {
    const { beforeUpload, uri, children } = this.props;
    const accessToken = localStorage.getItem(`${TOKEN_PREFIX}access_token`);
    const props = {
      action: uri,
      onChange: this.handleChange,
      beforeUpload: beforeUpload || this.handleBeforeUpload,
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
    const { importResult } = this.state;
    return (
      <React.Fragment>
        <ImportResult
          uri={uri}
          {...importResult}
          onCancel={() => {
            this.setState({
              importResult: {
                visible: false,
                error: importResult.error,
                response: {},
              },
            });
          }}
        />
        <Upload {...props} fileList={this.state.fileList}>
          <Button icon="cloud-upload">{children}</Button>
        </Upload>
      </React.Fragment>
    );
  }
}
UploadExcel.defaultProps = {
  onSuccess: () => {},
  onError: () => {},
  afterChange: () => {},
};
