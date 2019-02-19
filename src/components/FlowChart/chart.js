/* eslint-disable  no-param-reassign , no-shadow */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Popover } from 'antd';
import CircularJSON from 'circular-json';
import { remove, findIndex, last, difference } from 'lodash';
import { flowchartStatus, flowchartStatusColor } from '../../utils/convert';
import style from './index.less';

const asideWidth = 110;
const curveRadius = 14;
const colGap = 60;
const verticalRate = 150;
const lineStyle = {
  color: 'rgba(24,144,255,0.4)',
  width: 6,
};
const disableColor = 'rgb(153, 153, 153)';
const firstColLineStyle = {
  color: 'rgba(24,144,255,0.4)',
  width: 6,
};
const node = {
  radius: 18,
  color: '#1890ff',
  width: 6,
};
const test = [
  {
    id: 1,
    time: '1',
    next_id: [2, 3, 4],
    prev_id: [],
    status: 1,
    approver: 'xx',
    operate_at: 'xx',
    staff_sn: 'xxx',
  },
  { id: 2, time: '2', next_id: [5, 6], prev_id: [1] },
  { id: 3, time: '3', next_id: [7, 8], prev_id: [1] },
  { id: 4, time: '4', next_id: [9, 10], prev_id: [1] },
  { id: 5, time: '5', next_id: [12], prev_id: [2] },
  { id: 6, time: '6', next_id: [11], prev_id: [2] },
  { id: 7, time: '6', next_id: [13], prev_id: [3] },
  { id: 8, time: '6', next_id: [11], prev_id: [3] },
  { id: 9, time: '6', next_id: [13], prev_id: [4] },
  { id: 10, time: '6', next_id: [11], prev_id: [4] },
  { id: 11, time: '6', next_id: [13], prev_id: [6, 8, 10] },
  { id: 12, time: '6', next_id: [13], prev_id: [5] },
  { id: 13, time: '6', next_id: [], prev_id: [12, 9, 11, 7] },
];
let datas = [];
let cols = {};
let testKeyById = {};
let lines = [];
let rows = [];
let unfinishedLines = [];
@connect(({ manager }) => ({ currentUser: manager.current }))
class FlowChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chartData: [],
      chartLines: [],
      chartRows: [],
    };
  }

  componentDidMount() {
    this.canvas = document.getElementById('myCanvas');
    this.canvasContain = document.getElementById('canvasContain');
    this.ctx = this.canvas.getContext('2d');
    const { dataSource } = this.props;
    if (dataSource.length) {
      this.makeCanvasData(dataSource);
    }
  }

  componentWillReceiveProps(props) {
    const { dataSource = [] } = props;
    if (
      CircularJSON.stringify(dataSource) !== CircularJSON.stringify(this.props.dataSource) &&
      dataSource.length
    ) {
      this.makeCanvasData(dataSource);
    }
  }

  makeCanvasData = dataSource => {
    cols = {};
    testKeyById = {};
    lines = [];
    rows = [];
    unfinishedLines = [];
    datas = [...dataSource];
    // datas = [...test];
    const maxColIndex = this.makeChartData();
    this.makeCanvasSize(maxColIndex);
    this.setState(
      {
        chartData: [...datas],
        chartLines: [...lines],
        chartRows: [...rows],
        maxColIndex,
      },
      () => {
        this.draw();
      }
    );
  };

  makeChartData = () => {
    const pointIds = datas.map(item => item.id);
    datas.forEach((step, index) => {
      const nextId = step.next_id;
      const prevId = step.prev_id;
      this.filterCanceledPoint(nextId, pointIds);
      this.filterCanceledPoint(prevId, pointIds);
      testKeyById[step.id] = step;
      step.y = index + 1;
      let line = {};
      // 绑定点的X坐标
      if (step.prev_id.length === 0) {
        // 主节点
        line = this.createNewColLine(cols, '0.');
      } else if (step.prev_id.length > 1) {
        // 合并
        line = this.mergeLine(step);
      } else {
        // 不分叉
        const prevStep = testKeyById[step.prev_id[0]];
        const prevNext = prevStep.next_id;
        const prevLine = prevStep.line;
        if (prevNext.length > 1) {
          const subIndex = prevNext.indexOf(step.id);
          line = prevLine.next_id[subIndex];
        } else {
          line = prevLine;
        }
      }
      // 生成cols分支
      step.line = line;
      step.unfinishedLines = [...unfinishedLines];
      if (nextId.length > 1) {
        const subLines = this.separateColLine(step, step.y + 0.5);
        this.createNewRowLine(subLines[0].col, last(subLines).col, step.y + 0.5, 1);
      }
      if (nextId.length === 0) {
        this.finishColLine(step.line, step.y);
      }
    });
    const maxIndex = this.fillColsIndex(cols); // 生成index
    return maxIndex;
  };

  makeCanvasSize = maxIndex => {
    const { y } = last(datas);
    const width = maxIndex * colGap + 20;
    const height = (y + 0.5) * verticalRate + 40;
    if (this.canvas) {
      this.canvas.height = height * 3;
      this.canvas.width = width * 3;
      this.canvas.style.width = `${width}px`;
      this.canvas.style.height = `${height}px`;
    }
    if (this.canvasContain) {
      this.canvasContain.style.height = `${height / 3 + 40}px`;
      this.canvasContain.style.overflow = 'hidden';
    }
  };

  filterCanceledPoint = (prevId, pointIds) => {
    prevId.forEach(id => {
      if (pointIds.indexOf(id) === -1) {
        remove(prevId, item => id === item);
      }
    });
  };

  createNewRowLine = (minCol, maxCol, y, direction, crossingPoint = []) => {
    // direction为1，则圆弧向上，为负则向下
    const row = { start: minCol, end: maxCol, y, direction, crossingPoint };
    rows.push(row);
    return row;
  };

  createNewColLine = (col, colIndex, start = 1, prev_id = []) => {
    const line = { col, colIndex, start, end: '', prev_id, next_id: [], crossingPoint: [] };
    lines.push(line);
    prev_id.forEach(prevLine => {
      prevLine.next_id.push(line);
    });
    this.sortUnfinishedLines(line);
    return line;
  };

  sortUnfinishedLines = line => {
    const index = findIndex(unfinishedLines, item => item.colIndex > line.colIndex);
    unfinishedLines.splice(index === -1 ? unfinishedLines.length : index, 0, line);
  };

  /**
   * 生成线分支
   */
  separateColLine = (prevStep, startY) => {
    const prevLine = prevStep.line;
    this.finishColLine(prevLine, startY);
    return prevStep.next_id.map((next, subIndex) => {
      prevLine.col[subIndex] = prevLine.col[subIndex] || {};
      const col = prevLine.col[subIndex];
      const colIndex = `${prevLine.colIndex}${subIndex >= 10 ? subIndex : `0${subIndex}`}`;
      return this.createNewColLine(col, colIndex, startY, [prevLine]);
    });
  };

  mergeLine = step => {
    const prevSteps = datas.filter(item => step.prev_id.indexOf(item.id) !== -1);
    let max = '0';
    let min = '1';
    let minCol = {};
    let maxCol = {};
    prevSteps.forEach(prevStep => {
      const { col, colIndex } = prevStep.line;
      this.finishColLine(prevStep.line, step.y - 0.5); // 上一条线的结束点
      max = colIndex - max >= 0 ? colIndex : max;
      maxCol = colIndex - max >= 0 ? col : maxCol;
      min = colIndex - min <= 0 ? colIndex : min;
      minCol = colIndex - min <= 0 ? col : minCol;
    });
    const crossingPoint = [];
    this.createNewRowLine(minCol, maxCol, step.y - 0.5, -1);
    unfinishedLines.forEach(unline => {
      // 交叉
      if (unline.colIndex > min && unline.colIndex < max) {
        unline.crossingPoint.push(step.y - 0.5); // 交叉点
        crossingPoint.push(unline.col);
      }
    });
    this.createNewRowLine(minCol, maxCol, step.y - 0.5, -1, crossingPoint);
    const prevLines = prevSteps.map(item => item.line);
    const basicLine = this.findBasicLine(prevLines);
    const line = this.createNewColLine(basicLine.col, basicLine.colIndex, step.y - 0.5, prevLines);
    return line;
  };

  findBasicLine = prevLines => {
    const basicLines = this.findBasicLines({ prev_id: prevLines });
    let response = basicLines.shift();
    basicLines.forEach(basicLine => {
      response = basicLine.colIndex - response.colIndex >= 0 ? response : basicLine;
    });
    return response;
  };

  findBasicLines = (line, _basicLines = []) => {
    const prevLines = line.prev_id;
    let basicLines = [..._basicLines];
    if (prevLines.length === 0) {
      basicLines.push(line);
    } else if (prevLines.length > 1) {
      prevLines.forEach(prevLine => {
        basicLines = this.findBasicLines(prevLine, basicLines);
      });
    } else if (prevLines.length === 1) {
      const prevLine = prevLines[0];
      const prevLineNext = prevLine.next_id;
      if (prevLineNext.length === 1) {
        basicLines = this.findBasicLines(prevLine, basicLines);
      } else if (prevLineNext.length > 1) {
        const extraNext = difference(prevLineNext, basicLines);
        if (extraNext.length === 1 && extraNext[0] === line) {
          basicLines = difference(basicLines, prevLineNext);
          basicLines = this.findBasicLines(prevLine, basicLines);
        } else {
          basicLines.push(line);
        }
      }
    }
    return basicLines;
  };

  finishColLine = (line, endY) => {
    line.end = endY;
    remove(unfinishedLines, item => item === line);
    return line;
  };

  fillColsIndex = (cols, colIndex = 1) => {
    const index = colIndex;
    Object.keys(cols).forEach(key => {
      if (key > 0) colIndex += 1;
      colIndex = this.fillColsIndex(cols[key], colIndex);
    });
    cols.index = index;
    return colIndex;
  };

  drawRect = (x, y, w, h) => {
    if (this.canvas) {
      const { ctx } = this;
      ctx.beginPath();
      ctx.fillStyle = '#fff';
      ctx.fillRect(x, y, w, h);
    }
  };

  drawLine = (x1, y1, x2, y2, color, width = lineStyle.width) => {
    if (this.canvas) {
      const { ctx } = this;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineWidth = width;
      ctx.strokeStyle = color;
      ctx.stroke();
    }
  };

  drawArc = (
    x,
    y,
    r,
    sAngle = 0,
    eAngle = 2 * Math.PI,
    color,
    counterclockwise = false,
    fill = true,
    width = lineStyle.width
  ) => {
    const { ctx } = this;
    ctx.beginPath();
    ctx.arc(x, y, r, sAngle, eAngle, counterclockwise);
    // ctx.closePath();
    if (fill) {
      ctx.fillStyle = color;
      ctx.lineWidth = width;
      ctx.fill();
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.stroke();
    }
  };

  drawText = (str, x, y) => {
    if (this.canvas) {
      const { ctx } = this;
      ctx.font = '12px Georgia';
      ctx.fillStyle = 'red';
      ctx.fillText(str, x, y);
    }
  };

  drawCrossPoint = (crossingPoint, y, c1, c2) => {
    crossingPoint.forEach(point => {
      this.drawArc(point * colGap - 3, y * verticalRate, 15, -0.5 * Math.PI, 0.5 * Math.PI, c1);
      this.drawArc(point * colGap - 3, y * verticalRate, 9, -0.5 * Math.PI, 0.5 * Math.PI, c2);
    });
  };

  drawRing = (x, y, r1, r2, c1, c2) => {
    this.drawArc(x, y, r1, 0, 2 * Math.PI, c1);
    this.drawArc(x, y, r2, 0, 2 * Math.PI, c2);
  };

  drawGeneralArc = (x, y, r, color) => {
    this.drawArc(x, y, r, 0, 2 * Math.PI, color, false);
  };

  drawCurve = (x1, y1, x2, y2, direction, r = curveRadius, color) => {
    let c = { x: x1, y: y1 - 0 + r / verticalRate };
    if (direction < 0) {
      c = { x: x1, y: y1 - r / verticalRate };
    }
    this.drawLine(x1 * colGap, y1 * verticalRate, x2 * colGap, y1 * verticalRate, '#fff');
    this.drawLine(x2 * colGap, y1 * verticalRate, x2 * colGap, y2 * verticalRate, '#fff');
    console.log(color);
    this.drawArc(
      c.x * colGap,
      c.y * verticalRate,
      r,
      0,
      direction > 0 ? -0.5 * Math.PI : 0.5 * Math.PI,
      color,
      !!(direction > 0),
      false
    );
  };

  draw = () => {
    const { chartRows, chartData, chartLines } = this.state;
    const { status } = this.props;

    chartLines.forEach((line, i) => {
      const {
        col: { index },
        start,
        end,
      } = line;

      let color = index === 1 ? firstColLineStyle.color : lineStyle.color;
      if (status === -2) {
        color = disableColor;
      }
      this.drawLine(
        index * colGap,
        start * verticalRate,
        index * colGap,
        end * verticalRate,
        color
      );
    });
    chartRows.forEach(row => {
      const { start, end, y, direction, crossingPoint } = row;
      this.drawLine(
        start.index * colGap,
        y * verticalRate,
        end.index * colGap,
        y * verticalRate,
        status === -2 ? disableColor : lineStyle.color
      );
      const p1 = { x: end.index - curveRadius / colGap, y };
      const p2 = { x: end.index, y: y + direction * (curveRadius / verticalRate) };
      this.drawCurve(
        p1.x,
        p1.y,
        p2.x,
        p2.y,
        direction,
        curveRadius,
        status === -2 ? disableColor : lineStyle.color
      );
      if (crossingPoint.length) {
        const crossing = crossingPoint.map(item => item.index);
        this.drawCrossPoint(crossing, y, status === -2 ? disableColor : lineStyle.color, '#fff');
      }
    });
    chartData.forEach(point => {
      const {
        line: {
          col: { index },
        },
        y,
      } = point;
      if (y === 1) {
        this.drawRing(
          index * colGap,
          y * verticalRate,
          node.radius,
          node.radius - 1,
          status === -2 ? disableColor : node.color,
          '#fff'
        );
      } else {
        const color = `${point.action_type}` === '0' ? 'rgb(245,166,35)' : node.color;
        this.drawGeneralArc(
          index * colGap,
          y * verticalRate,
          node.radius,
          status === -2 ? disableColor : color
        );
      }
    });
  };

  renderPopContent = modalInfo => {
    const { remark, statusMsg, approverName, statusColor, cc, optTime, withdrawTime } = modalInfo;
    return (
      <div style={{ width: '375px' }}>
        <div className={style.remark}>
          <span>审批人</span>
          <div>{approverName}</div>
        </div>
        <div className={style.remark}>
          <span>操作</span>
          <div style={{ color: statusColor }}>{statusMsg}</div>
        </div>
        <div className={style.remark}>
          <span>备注</span>
          <div>{remark || '无'}</div>
        </div>
        <div className={style.remark}>
          <span>操作时间</span>
          <div>{optTime || '无'}</div>
        </div>
        {withdrawTime ? (
          <div className={style.remark}>
            <span>撤回时间</span>
            <div>{withdrawTime}</div>
          </div>
        ) : null}

        <div className={style.remark}>
          <span>抄送人</span>
          <div>{cc && cc.length ? cc.map(c => `${c.staff_name}`).join('、') : '无'}</div>
        </div>
      </div>
    );
  };

  renderTimeLine = () => {
    const { status, currentUser } = this.props;
    const { chartData, maxColIndex } = this.state;
    const timelines = chartData.map((line, i) => {
      const { y, id } = line;
      // const lastLines = last(line.unfinishedLines || []);
      // const maxColIndex = lastLines ? lastLines.col.index : 0;
      const leftStyle = {
        position: 'absolute',
        left: (maxColIndex * colGap) / 3 + 20 + 6 + asideWidth,
        top: (y * verticalRate) / 3 - 11,
        height: '22px',
        lineHeight: '22px',
        display: 'flex',
        justifyContent: 'space-between',
      };

      const rightStyle = {
        position: 'absolute',
        left: (maxColIndex * colGap) / 3 + 10 + 108 + 120 + asideWidth,
        top: (y * verticalRate) / 3 - 11,
        height: '22px',
        lineHeight: '22px',
        color: '#999',
        fontSize: '14px',
      };
      const fisrtDivStyle = {
        fontSize: '14px',
        color: '#666',
      };
      const timeStyle = {
        fontSize: '14px',
        display: 'inline-block',
        marginRight: '40px',
        width: '150px',
      };
      let modalInfo = {
        remark: line.remark,
        approverName: line.approver_name,
        cc: line.step_cc,
        optTime: line.acted_at,
      };
      let statusMsg =
        i === chartData.length - 1 && status === 1 ? '完成' : flowchartStatus(line.action_type);
      if (status === -2 && i === 0) {
        statusMsg = '发起（撤回）';
        modalInfo.withdrawTime = chartData[chartData.length - 1].acted_at;
      } else if (line.action_type === -2) {
        statusMsg = '';
      }
      const optater =
        `${line.approver_sn}` === `${currentUser.staff_sn}` ? '我' : line.approver_name;

      const statusColor = status === -2 ? disableColor : flowchartStatusColor(line.action_type);
      const remarkBtnStyle = {
        dispaly: 'inline-block',
        cursor: 'pointer',
      };
      modalInfo = {
        ...modalInfo,
        statusMsg,
        statusColor,
      };

      return (
        <React.Fragment key={id}>
          <div style={{ ...leftStyle, background: '#fff' }}>
            <div style={{ display: 'flex' }}>
              <span style={{ ...fisrtDivStyle, width: '56px' }} className={style.textover}>
                {optater}
              </span>
              <span style={{ ...fisrtDivStyle, marginLeft: '10px', color: statusColor }}>
                {statusMsg}
              </span>
            </div>
          </div>
          {line.action_type === -2 ? null : (
            <div style={{ ...rightStyle }}>
              <span style={{ ...timeStyle }}>{line.acted_at}</span>
              {line.remark || line.step_cc.length || (i === 0 && status === -2) ? (
                <Popover placement="right" content={this.renderPopContent(modalInfo)}>
                  <span className={style.look} style={{ ...remarkBtnStyle }}>
                    查看详情
                  </span>
                </Popover>
              ) : null}
            </div>
          )}
        </React.Fragment>
      );
    });
    return timelines;
  };

  render() {
    const { chartData } = this.state;
    return (
      <div
        style={{ background: '#fff', position: 'relative', paddingLeft: '6px' }}
        id="canvasContain"
      >
        <div
          style={{
            color: '#333333',
            lineHeight: '20px',
            fontSize: '14px',
            float: 'left',
            width: '110px',
            position: 'absolute',
            top: '32px',
          }}
        >
          审批进度
        </div>
        <div style={{ marginLeft: `${asideWidth}px` }}>
          <canvas id="myCanvas" />
        </div>
        {chartData.length > 1 ? this.renderTimeLine() : null}
      </div>
    );
  }
}

FlowChart.defaultProps = {
  dataSource: [],
};

export default FlowChart;
