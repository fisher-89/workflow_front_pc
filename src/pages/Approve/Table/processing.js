import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Popconfirm, Divider } from 'antd';
import { Link } from 'dva/router';
import moment from 'moment';

import { convertTimeDis } from '../../../utils/utils';
import OATable from '../../../components/OATable';

const type = 'processing';
@connect(({ loading, start, approve }) => ({
  listLoading: loading.effects['approve/fetchApproveList'],
  approveListDetails: approve.approveListDetails,
  availableFlows: start.availableFlows,
}))
class Processing extends Component {
  componentWillMount() {
    this.fetchApproveList({ page: 1, pagesize: 10 });
  }

  fetchApproveList = params => {
    const { dispatch } = this.props;
    dispatch({
      type: 'approve/fetchApproveList',
      payload: {
        params: { ...(params || {}), type: 'processing' },
      },
    });
  };

  widthDraw = id => {};

  makeColums = () => {
    const { availableFlows } = this.props;

    const columns = [
      {
        title: '序号',
        dataIndex: 'id',
        key: 'id',
        sorter: true,
      },
      {
        title: '流程类型',
        dataIndex: 'flow_type_id',
        key: 'flow_type_id',
        filters: availableFlows.map(item => ({ text: item.name, value: item.id })),
        render: a => {
          const flow = (availableFlows || []).find(item => item.id === a);
          return flow ? flow.name : '';
        },
      },
      {
        title: '流程名称',
        dataIndex: 'flow_name',
        key: 'flow_name',
        searcher: true,
      },
      {
        title: '发起时间',
        dataIndex: 'created_at',
        key: 'created_at',
        dateFilters: true,
        sorter: true,
      },
      {
        title: '历时',
        render: a => {
          const disTime = a.created_at
            ? convertTimeDis(moment().format('YYYY-MM-DD h:mm:ss'), a.created_at)
            : '';
          return disTime;
        },
      },
      {
        title: '操作',
        render: ({ id }) => (
          <Fragment>
            <Link to={`/start_detail/${id}`}>查看</Link>
            <Divider type="vertical" />
            <Popconfirm onConfirm={() => this.widthDraw(id)} title="确定要撤回该流程吗？">
              <a>通过</a>
            </Popconfirm>
            <Divider type="vertical" />
            <Popconfirm onConfirm={() => this.widthDraw(id)} title="确定要撤回该流程吗？">
              <a>驳回</a>
            </Popconfirm>
            <Divider type="vertical" />
            <Popconfirm onConfirm={() => this.widthDraw(id)} title="确定要撤回该流程吗？">
              <a>转交</a>
            </Popconfirm>
          </Fragment>
        ),
      },
    ];
    return columns;
  };

  render() {
    const { listLoading } = this.props;
    const { approveListDetails } = this.props;
    const list = approveListDetails[type] || {};
    const { data, total } = list;
    return (
      <div>
        <OATable
          serverSide
          loading={listLoading}
          columns={this.makeColums()}
          data={data}
          fetchDataSource={this.fetchApproveList}
          total={total || 0}
        />
      </div>
    );
  }
}

export default Processing;
