import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { convertTimeDis } from '../../../utils/utils';
import { getApprState, approConverSta } from '../../../utils/convert';
import OATable from '../../../components/OATable';

const type = 'approved';

const approveState = [
  { label: '已驳回', value: -1 },
  { label: '已通过', value: 2 },
  { label: '已转交', value: 3 },
];
@connect(({ loading, start, approve }) => ({
  listLoading: loading.effects['approve/fetchApproveList'],
  approveListDetails: approve.approveListDetails,
  availableFlows: start.availableFlows,
}))
class Approved extends Component {
  componentWillMount() {
    this.fetchApproveList({ page: 1, pagesize: 10 });
  }

  fetchApproveList = params => {
    const { dispatch } = this.props;
    dispatch({
      type: 'approve/fetchApproveList',
      payload: {
        params: { ...(params || {}), type },
      },
    });
  };

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
        title: '审批时间',
        dataIndex: 'acted_at',
        key: 'acted_at',
        dateFilters: true,
        sorter: true,
      },
      {
        title: '审批结果',
        dataIndex: 'action_type',
        filters: approveState.map(item => ({ text: item.label, value: item.value })),
        render: r => (r ? getApprState(r) : ''),
      },
      {
        title: '操作',
        render: ({ id }) => (
          <Fragment>
            <Link to={`/start_detail/${id}`}>查看</Link>
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

export default Approved;
