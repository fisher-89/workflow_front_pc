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

  renderInfo = (value, { field, template, field: { row }, ratio: { smXRatio, smYRatio } }) => (
    <DetailItem
      {...field}
      template={template}
      extraStyle={{
        // height: 'auto',
        minHeight: template ? `${row * smYRatio}px` : `${smYRatio}px`,
        minWidth: template ? `${8 * smXRatio}px` : `${4 * smXRatio}px`,
      }}
      tooltip={false}
      rightContStyle={{ padding: '3px 0 3px 10px' }}
    >
      <div style={{ display: 'flex' }}>
        {' '}
        {(value || []).map(item => (
          <div
            style={{
              height: '24px',
              background: '#fff',
              border: '1px solid #ccc',
              padding: '0 10px',
              marginRight: '5px',
            }}
          >
            {item}
          </div>
        ))}
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
