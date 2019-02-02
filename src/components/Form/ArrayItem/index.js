import React, { PureComponent } from 'react';
import { connect } from 'dva';
import FormItem from '../FormItem';
import DetailItem from '../DetailItem';

import TagGroup from '../../TagGroup';
import { judgeIsNothing } from '../../../utils/utils';

import style from './index.less';

@connect(({ interfaceApi }) => ({ sourceDetails: interfaceApi.sourceDetails }))
class SelectItem extends PureComponent {
  constructor(props) {
    super(props);
    const { defaultValue } = this.props;
    this.state = {
      value: defaultValue,
      errorMsg: '',
    };
  }

  componentWillReceiveProps(props) {
    const { value, errorMsg } = props;
    if (JSON.stringify(value) !== this.props.value || errorMsg !== this.props.errorMsg) {
      this.setState({
        value,
        errorMsg,
      });
    }
  }

  handleOnChange = value => {
    let errorMsg = '';
    const {
      field: { name },
      required,
      onChange,
    } = this.props;
    if (required && !judgeIsNothing(value)) {
      errorMsg = `请选择${name}`;
    }
    this.setState(
      {
        value,
        errorMsg,
      },
      () => {
        onChange(value, errorMsg);
      }
    );
  };

  getOptions = () => {
    const {
      field: { options },
    } = this.props;
    const newOpts = (options || []).map(item => {
      const opt = { value: item, text: item };
      return opt;
    });
    return newOpts;
  };

  renderInfo = (value, { field, template, ratio: { smXRatio } }) => (
    <DetailItem
      {...field}
      template={template}
      extraStyle={{
        minWidth: template ? `auto` : `${10 * smXRatio}px`,
      }}
      rightStyle={template ? { overflowY: 'scroll' } : {}}
      tooltip={false}
      rightContStyle={{ padding: '3px 0 0px 0px', overflowY: template ? 'scroll' : ' initial' }}
    >
      <div style={{ paddingLeft: '10px' }}>
        {' '}
        {(value || []).map(item => (
          <div
            style={{
              height: '24px',
              float: 'left',
              background: '#fff',
              border: '1px solid #ccc',
              padding: '0 10px',
              marginRight: '5px',
              marginBottom: '3px',
            }}
          >
            {' '}
            {item}
          </div>
        ))}{' '}
        <div style={{ clear: 'left' }} />
      </div>
    </DetailItem>
  );

  render() {
    const {
      field,
      required,
      disabled,
      readonly,
      template,
      ratio: { xRatio },
      field: { max, min },
    } = this.props;
    const { errorMsg, value } = this.state;
    const className = [style.tag, errorMsg ? style.errorMsg : ''].join(' ');
    if (readonly) {
      return this.renderInfo(value, this.props);
    }
    return (
      <FormItem
        {...field}
        errorMsg={errorMsg}
        disabled={disabled}
        required={required}
        template={template}
        extraStyle={{ minWidth: `${8 * xRatio}px` }}
        rightStyle={{ paddingLeft: '10px' }}
      >
        <div className={className}>
          <TagGroup
            value={value}
            range={{ max, min }}
            disabled={disabled}
            onChange={this.handleOnChange}
          />
        </div>
      </FormItem>
    );
  }
}

export default SelectItem;
