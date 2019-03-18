import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { last } from 'lodash';
import { convertTimeDis } from '../../../utils/utils';
import OATable from '../../../components/OATable';

const type = 'all';
@connect(({ loading, start, cc }) => ({
  listLoading: loading.effects['cc/fetchCCList'],
  ccList: cc.ccList,
  availableFlows: start.availableFlows,
}))
class CCList extends Component {
  componentWillMount() {
    this.fetchCCList({ page: 1, pagesize: 10 });
  }

  fetchCCList = params => {
    const { dispatch } = this.props;
    dispatch({
      type: 'cc/fetchCCList',
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
        title: '流程名称',
        dataIndex: 'flow_name',
        key: 'flow_name',
        searcher: true,
      },
      {
        title: '抄送时间',
        dataIndex: 'updated_at',
        key: 'updated_at',
        dateFilters: true,
        sorter: true,
      },
      {
        title: '发起人',
        render: a => a.flow_run.creator_name,
      },
      {
        title: '审批人',
        render: a => {
          const stepRun = a.flow_run.step_run;
          if (stepRun) {
            const lastStep = last(stepRun);
            return lastStep.approver_name;
          }
          return '';
        },
      },
      {
        title: '步骤名称',
        dataIndex: 'step_name',
        key: 'step_name',
        searcher: true,
      },
      {
        title: '历时',
        render: a => {
          const disTime = a.updated_at ? convertTimeDis(a.updated_at) : '';
          return disTime;
        },
      },
      {
        title: '操作',
        render: ({ id }) => (
          <Fragment>
            <Link to={`/cc_detail/${id}`}>查看</Link>
          </Fragment>
        ),
      },
    ];
    return columns;
  };

  render() {
    const { listLoading, ccList } = this.props;
    const { data, total } = ccList;
    return (
      <div>
        <OATable
          serverSide
          loading={listLoading}
          columns={this.makeColums()}
          data={data}
          fetchDataSource={this.fetchCCList}
          total={total || 0}
        />
      </div>
    );
  }
}

export default CCList;
