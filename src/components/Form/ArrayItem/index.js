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
      onChange,
    } = this.props;
    if (!judgeIsNothing(value)) {
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

  renderInfo = (value, { field, template, field: { row } }) => (
    <DetailItem
      {...field}
      template={template}
      extraStyle={{
        height: 'auto',
        minHeight: template ? `${row * 50}px` : '50px',
        minWidth: template ? '600px' : '300px',
      }}
    >
      <span>{(value || []).join('，')}</span>
    </DetailItem>
  );

  render() {
    const {
      field,
      required,
      disabled,
      readonly,
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
        required={required}
        extraStyle={{ height: 'auto', minWidth: '600px' }}
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
