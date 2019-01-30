import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { last } from 'lodash';
import OATable from '../../../components/OATable';

const type = 'rejected';
@connect(({ loading, start }) => ({
  listLoading: loading.effects['start/fetchStartList'],
  rejectedStart: start.rejectedStart || {},
  availableFlows: start.availableFlows,
}))
class StartList extends Component {
  componentWillMount() {
    this.fetchStartList({ page: 1, pagesize: 10 });
  }

  fetchStartList = params => {
    const { dispatch } = this.props;
    dispatch({
      type: 'start/fetchStartList',
      payload: {
        params: { ...(params || {}), type },
      },
    });
  };

  makeColums = () => {
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
        searcher: true,
        render: a => {
          const { availableFlows } = this.props;
          const flow = (availableFlows || []).find(item => item.id === a);
          return flow ? flow.name : '';
        },
      },
      {
        title: '流程名称',
        dataIndex: 'name',
        key: 'name',
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
        title: '审批人',
        dateFilters: true,
        searcher: true,
        render: a => {
          const stepRun = a.step_run;
          return last(stepRun).approver_name;
        },
      },
      {
        title: '驳回原因',
        render: a => {
          const stepRun = a.step_run;
          return last(stepRun).remark;
        },
      },
      {
        title: '驳回时间',
        dataIndex: 'end_at',
        key: 'end_at',
        dateFilters: true,
        sorter: true,
      },
      {
        title: '操作',
        render: ({ id }) => (
          <Fragment>
            <Link to={`/start/${id}`}>查看</Link>
          </Fragment>
        ),
      },
    ];
    return columns;
  };

  render() {
    const { listLoading } = this.props;
    const { rejectedStart } = this.props;
    const { data, total } = rejectedStart || {};
    return (
      <div>
        <OATable
          serverSide
          loading={listLoading}
          columns={this.makeColums()}
          data={data}
          fetchDataSource={this.fetchStartList}
          total={total || 0}
        />
      </div>
    );
  }
}

export default StartList;
