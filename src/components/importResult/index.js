import React from 'react';
import XLSX from 'xlsx';
import moment from 'moment';
import { Modal, Button, Icon } from 'antd';
import OATable from '../OATable';
import styles from './index.less';
import TableUpload from '../OATable/upload';

export default class Result extends React.PureComponent {
  state = {
    response: {
      data: [],
      headers: [],
      errors: [],
    },
    second: 3,
  };

  componentWillReceiveProps(nextProps) {
    if ('response' in nextProps) {
      const { response } = nextProps;
      this.setState({ response });
    }
    if (nextProps.visible && !nextProps.error) {
      this.setState({ second: 3 }, () => {
        clearInterval(this.timer);
        this.timer = setInterval(this.timerCountDown, 1000);
      });
    }
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  timerCountDown = () => {
    const { second } = this.state;
    this.setState({ second: second - 1 }, () => {
      if (this.state.second === 0) {
        clearInterval(this.timer);
        this.props.onCancel();
      }
    });
  };

  makeColumns = () => {
    const columns = [
      {
        colSpan: 0,
        title: 'row',
        align: 'center',
        dataIndex: 'row',
        render: (value, record) => {
          const obj = {
            children: `第 ${value} 行`,
            props: {
              rowSpan: !record.rowKey ? 0 : record.length,
            },
          };
          return obj;
        },
      },
      {
        colSpan: 2,
        title: '标题',
        dataIndex: 'title',
      },
      {
        width: 300,
        title: '失败原因',
        dataIndex: 'reason',
        render: key => OATable.renderEllipsis(key, true),
      },
    ];
    return columns;
  };

  xlsExportExcelError = ({ headers, errors }) => {
    const workbook = XLSX.utils.book_new();
    const errorExcel = [];
    const newHeaders = [...headers, '错误信息'];
    errors.forEach(error => {
      const { rowData } = error;
      const errorMessage = error.message;
      const errMsg = Object.keys(errorMessage)
        .map(msg => `${msg}:${errorMessage[msg].join(',')}`)
        .join(';\n');
      rowData.push(errMsg);
      errorExcel.push(error.rowData);
    });
    errorExcel.unshift(newHeaders);
    const errorSheet = XLSX.utils.aoa_to_sheet(errorExcel);
    XLSX.utils.book_append_sheet(workbook, errorSheet, '错误信息');
    XLSX.writeFile(workbook, '错误信息.xlsx');
  };

  renderSuccess = ({ data = [] }) => {
    const successLength = data.length;
    return (
      <div className={styles.content}>
        <div className={styles.resultSuccess}>
          <Icon type="check-circle" className={styles.icon} />
          <div className={styles.message}>
            成功上传
            <span className={styles.successColor}>{successLength}</span>条
            <p className={styles.timer}>{moment().format('YYYY-MM-DD HH:mm:ss')}</p>
          </div>
        </div>
        <Button
          type="primary"
          style={{
            left: '50%',
            marginTop: 20,
            marginLeft: '-50px',
            position: 'relative',
          }}
          onClick={this.props.onCancel}
        >
          确定（
          {this.state.second}）
        </Button>
      </div>
    );
  };

  renderError = response => {
    const { errors = [], data = [] } = response;
    let errorData = [];
    errors.forEach(item => {
      const messageLength = Object.keys(item.message).length;
      const temp = Object.keys(item.message).map((msg, index) => ({
        title: msg,
        row: item.row,
        rowKey: index === 0,
        length: messageLength,
        reason: item.message[msg].join(';'),
      }));
      errorData = [...errorData, ...temp];
    });
    const errorLength = errors.length;
    const successLength = data.length;
    return (
      <React.Fragment>
        <div className={styles.header}>
          <div className={styles.message}>
            成功上传
            <span className={styles.successColor}>{successLength}</span>
            条，失败
            <span className={styles.errorColor}>{errorLength}</span>
            条。
            <p className={styles.timer}>{moment().format('YYYY-MM-DD HH:mm:ss')}</p>
          </div>
          <div>
            {this.props.uri !== undefined ? (
              <TableUpload
                uri={this.props.uri}
                afterChange={() => {
                  this.props.onCancel();
                }}
              >
                继续导入
              </TableUpload>
            ) : null}
          </div>
        </div>
        <div className={styles.tableResult}>
          <div className={styles.tableHeader}>
            <p>失败明细</p>
            <a onClick={() => this.xlsExportExcelError(response)}>下载失败明细</a>
          </div>
          <OATable
            bordered
            sync={false}
            data={errorData}
            pagination={false}
            scroll={{ y: 300 }}
            columns={this.makeColumns()}
          />
        </div>
      </React.Fragment>
    );
  };

  render() {
    const { error } = this.props;
    const { response } = this.state;
    return (
      <Modal {...this.props}>
        {error ? this.renderError(response) : this.renderSuccess(response)}
      </Modal>
    );
  }
}

Result.defaultProps = {
  width: 800,
  error: false,
  visible: false,
  footer: false,
  title: '导入结果',
  response: {},
};
