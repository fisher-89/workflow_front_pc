import React, { PureComponent } from 'react';
import { Pagination, Modal } from 'antd';
import StaffItem from './StaffItem';
import style from './index.less';

class StaffModal extends PureComponent {
  constructor(props) {
    super(props);
    const { visible } = this.props;
    this.state = {
      visible,
    };
  }

  componentWillReceiveProps(props) {
    const { visible } = props;
    if (visible !== this.props.visible) {
      this.setState({
        visible,
      });
    }
  }

  render() {
    const { visible } = this.state;
    return (
      <div id="staff">
        <Modal
          visible={visible}
          width="800px"
          bodyStyle={{ padding: 0 }}
          title="选择员工"
          okText="确认"
          cancelText="取消"
          getContainer={() => document.getElementById('staff')}
        >
          <div className={style.global_modal}>
            <div className={style.modal_content}>
              <div className={style.left_content}>
                <div className={style.content_search} style={{ height: '40px' }}>
                  搜索框
                </div>
                <div className={style.search_result_content}>
                  <div style={{ height: '44px' }} />
                  <div style={{ color: '#333333', fontSize: '12px', lineHeight: '20px' }}>
                    <span>搜索结果</span>
                    <span>全选</span>
                    <span>筛选</span>
                  </div>
                  <div className={style.search_result}>
                    <StaffItem extra={null} />
                    <StaffItem extra={null} />
                    <StaffItem extra={null} />
                    <StaffItem extra={null} />
                    <StaffItem extra={null} />
                    <StaffItem extra={null} />
                    <StaffItem extra={null} />
                    <StaffItem extra={null} />
                    <StaffItem extra={null} />
                    <StaffItem extra={null} />
                    <StaffItem extra={null} />
                    <StaffItem extra={null} />
                  </div>
                  <div className={style.page}>
                    <Pagination size="small" total={50} showQuickJumper />
                  </div>
                </div>
              </div>
              <div className={style.select_result}>
                <div
                  style={{ height: '40px', lineHeight: '40px', color: '#333', fontSize: '14px' }}
                >
                  已选：8/
                  <span style={{ color: '#999' }}>50</span>
                </div>
                <div className={style.checked_list}>
                  <StaffItem itemStyle={{ marginRight: '0' }} />
                  <StaffItem itemStyle={{ marginRight: '0' }} />
                  <StaffItem itemStyle={{ marginRight: '0' }} />
                  <StaffItem itemStyle={{ marginRight: '0' }} />
                  <StaffItem itemStyle={{ marginRight: '0' }} />
                  <StaffItem itemStyle={{ marginRight: '0' }} />
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}
StaffModal.defaultProps = {
  extra: <div className={style.delete} />,
};
export default StaffModal;
