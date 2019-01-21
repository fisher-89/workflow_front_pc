/* eslint no-param-reassign:0 */

import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  TextItem,
  AddressItem,
  UploadItem,
  InterfaceItem,
  SelectItem,
  ArrayItem,
  DateItem,
  TimeItem,
  SelectStaffItem,
  SelectDepItem,
  ShopSelectItem,
} from '../index';
import style from './index.less';
import { makeMergeSort } from '../../../utils/utils';

const yRatio = 40;
const xRatio = 60;
@connect(({ start }) => ({ startDetails: start.startDetails }))
class EditForm extends PureComponent {
  constructor(props) {
    super(props);
    const { startflow } = props;
    this.dealStartForm(startflow);
    // this.rows = this.makeFormInSameRows(this.visibleForm.concat(this.availableGridItem));
    this.rows = this.makeRowGroup(this.visibleForm, this.availableGridItem);

    const formData = startflow ? this.initFormData() : {};
    this.state = {
      formData,
      startflow,
    };
  }

  componentWillReceiveProps(props) {
    const { startflow } = props;
    if (startflow && JSON.stringify(startflow) !== JSON.stringify(this.props.startflow)) {
      this.dealStartForm(startflow);
      // this.rows = this.makeFormInSameRows(this.visibleForm.concat(this.availableGridItem));
      this.rows = this.makeRowGroup(this.visibleForm, this.availableGridItem);

      const newFormData = startflow ? this.initFormData() : {};
      this.setState({
        formData: newFormData,
        startflow,
      });
    }
  }

  makeRowGroup = (visibleForm, gridForm) => {
    const rows = {};
    const addBottmsForm = visibleForm.map(item => {
      const obj = { ...item, bottom: item.y + item.row };
      return obj;
    });
    let sortForms = makeMergeSort(addBottmsForm, 'bottom');
    if (gridForm.length) {
      const sortGrids = makeMergeSort(gridForm, 'y');
      sortGrids.forEach(grid => {
        const { y } = grid;
        const newRow = sortForms.filter(item => item.y < y);
        let obj = {};
        if (newRow.length) {
          obj = {
            y: sortForms[0].y,
            data: newRow,
          };
          rows[sortForms[0].y] = { ...obj };
        }
        sortForms = sortForms.filter(item => item.y > y);
        rows[y] = { y, data: [grid], isGrid: true };
      });
      if (sortForms.length) {
        rows[sortForms[0].y] = { y: sortForms[0].y, data: sortForms };
      }
    } else {
      rows[sortForms[0].y] = { y: sortForms[0].y, data: sortForms };
    }
    return rows;
  };

  dealStartForm = startflow => {
    if (!startflow) {
      return;
    }
    this.startflow = startflow;
    this.availableForm = startflow.fields.form.filter(
      item => startflow.step.available_fields.indexOf(item.key) > -1
    );
    this.visibleForm = this.availableForm.filter(
      item => startflow.step.hidden_fields.indexOf(item.key) === -1
    );
    this.availableGrid = startflow.fields.grid.filter(
      item => startflow.step.available_fields.indexOf(item.key) > -1
    );
    this.availableGridItem = this.availableGrid.map(item => {
      const { fields } = item;
      const obj = {
        ...item,
        availableForm: [],
        availableFields: [],
      };
      const avilable = this.dealGridForm(fields, item, startflow, 1);
      obj.availableForm = [...avilable.forms];
      obj.availableFields = [...avilable.fields];
      const visible = this.dealGridForm(avilable.fields, item, startflow, 2);
      obj.visibleForm = [...visible.forms];
      obj.visibleFields = [...visible.fields];
      return obj;
    });
  };

  dealGridForm = (source, item, startflow, type) => {
    const forms = [];
    const fields = [];
    source.forEach(field => {
      const str = `${item.key}.*.${field.key}`;
      const newField = { ...field };
      if (
        type === 1
          ? startflow.step.available_fields.indexOf(str) > -1
          : startflow.step.hidden_fields.indexOf(str) === -1
      ) {
        forms.push(field.key);
        fields.push(newField);
      }
    });
    return {
      forms,
      fields,
    };
  };

  makeFormInSameRows = visibleForm => {
    const rows = {};
    visibleForm.forEach(item => {
      const { y } = item;
      if (rows[y]) {
        rows[y].push(item);
      } else rows[y] = this.makeNewRow(item, y);
    });
    visibleForm.forEach(item => {
      const { y, row } = item;
      if (row > 1) {
        this.mergeRows(rows, y, row);
      }
    });
    return this.rearrangementRows(rows);
  };

  mergeRows = (rows, y, row) => {
    let count = 0;
    while (count < row - 1) {
      count += 1;
      rows[y] = rows[y].concat(rows[count + y] || []);
      delete rows[count + y];
    }
  };

  makeNewRow = item => {
    const currentRow = [];
    currentRow.push(item);
    return currentRow;
  };

  rearrangementRows = rows => {
    const newRows = { ...rows };
    Object.keys(rows).forEach(row => {
      let hasBase = false;
      const rowItem = rows[row].map(item => {
        const obj = { ...item };
        if (item.row > 1) {
          obj.base = true;
          hasBase = true;
        }
        return obj;
      });
      if (!hasBase) {
        rowItem[0].base = true;
      }
      newRows[row] = rowItem;
    });
    return newRows;
  };

  initFormData = () => {
    const newForm = this.availableForm.concat(this.availableGridItem);
    const formData = {};
    newForm.forEach(item => {
      const { key, availableFields } = item;
      const obj = {
        key,
        name: item.name,
        readonly: true,
      };
      const value = this.startflow.form_data[key];
      if (availableFields) {
        const gridValue = value.map(its => {
          const gridformData = {};
          availableFields.forEach(it => {
            const temp = {
              key: it.key,
              name: it.name,
              value: its[it.key],
              readonly: true,
            };
            gridformData[it.key] = { ...temp };
          });
          return gridformData;
        });
        obj.value = [...gridValue];
        obj.isGrid = true;
      } else {
        obj.value = value;
      }
      formData[key] = { ...obj };
    });
    return formData;
  };

  renderFormItem = (item, formInfo, keyInfo) => {
    const { type } = item;
    switch (type) {
      case 'time':
        return this.renderTimeItem(item, formInfo, keyInfo);
      case 'datetime':
      case 'date':
        return this.renderDateItem(item, formInfo, keyInfo);
      case 'array':
        return this.renderArray(item, formInfo, keyInfo);
      case 'text':
      case 'int':
        return this.renderTextItem(item, formInfo, keyInfo);
      case 'select':
        return this.renderSelectItem(item, formInfo, keyInfo);
      case 'api':
        return this.renderInterfaceItem(item, formInfo, keyInfo);
      case 'file':
        return this.renderFileItem(item, formInfo, keyInfo);
      case 'region':
        return this.renderAddressItem(item, formInfo, keyInfo);
      case 'staff':
        return this.renderStaffItem(item, formInfo, keyInfo);
      case 'department':
        return this.renderDepartItem(item, formInfo, keyInfo);
      case 'shop':
        return this.renderShopItem(item, formInfo, keyInfo);
      default:
        return null;
    }
  };

  renderDateTime = (item, formInfo, keyInfo) => {
    const { value } = formInfo;
    const { domKey } = keyInfo;
    return (
      <div className={style.edit_form} key={domKey}>
        <TimeItem field={item} defaultValue={value} {...formInfo} />
      </div>
    );
  };

  renderArray = (item, formInfo, keyInfo) => {
    const { value } = formInfo;
    const { domKey } = keyInfo;

    return (
      <div className={style.edit_form} key={domKey}>
        <ArrayItem field={item} defaultValue={value} {...formInfo} />
      </div>
    );
  };

  renderFileItem = (item, formInfo, keyInfo) => {
    const { value } = formInfo;
    const { domKey } = keyInfo;
    return (
      <div className={style.edit_form} key={domKey}>
        <UploadItem field={item} defaultValue={value} {...formInfo} />
      </div>
    );
  };

  renderTextItem = (item, formInfo, keyInfo) => {
    const { value } = formInfo;
    const { domKey } = keyInfo;
    return (
      <div className={style.edit_form} key={domKey}>
        <TextItem field={item} defaultValue={value} {...formInfo} />
      </div>
    );
  };

  renderDateItem = (item, formInfo, keyInfo) => {
    const { value } = formInfo;
    const { domKey } = keyInfo;
    return (
      <div className={style.edit_form} key={domKey}>
        <DateItem field={item} defaultValue={value} {...formInfo} />
      </div>
    );
  };

  renderTimeItem = (item, formInfo, keyInfo) => {
    const { value } = formInfo;
    const { domKey } = keyInfo;
    return (
      <div className={style.edit_form} key={domKey}>
        <TimeItem field={item} defaultValue={value} {...formInfo} />
      </div>
    );
  };

  renderSelectItem = (item, formInfo, keyInfo) => {
    const { value } = formInfo;
    const { domKey } = keyInfo;

    return (
      <div className={style.edit_form} key={domKey}>
        <SelectItem field={item} defaultValue={value} {...formInfo} />
      </div>
    );
  };

  renderInterfaceItem = (item, formInfo, keyInfo) => {
    const { value } = formInfo;
    const { domKey } = keyInfo;
    return (
      <div className={style.edit_form} key={domKey}>
        <InterfaceItem field={item} defaultValue={value} {...formInfo} />
      </div>
    );
  };

  renderAddressItem = (item, formInfo, keyInfo) => {
    const { value } = formInfo;
    const { domKey } = keyInfo;
    return (
      <div className={style.edit_form} key={domKey}>
        <AddressItem field={item} defaultValue={value} {...formInfo} />
      </div>
    );
  };

  renderStaffItem = (item, formInfo, keyInfo) => {
    const { value } = formInfo;
    const { domKey } = keyInfo;
    return (
      <div className={style.edit_form} key={domKey}>
        <SelectStaffItem field={item} defaultValue={value} {...formInfo} />
      </div>
    );
  };

  renderDepartItem = (item, formInfo, keyInfo) => {
    const { value } = formInfo;
    const { domKey } = keyInfo;
    return (
      <div className={style.edit_form} key={domKey}>
        <SelectDepItem field={item} defaultValue={value} {...formInfo} />
      </div>
    );
  };

  renderShopItem = (item, formInfo, keyInfo) => {
    const { value } = formInfo;
    const { domKey } = keyInfo;
    return (
      <div className={style.edit_form} key={domKey}>
        <ShopSelectItem field={item} defaultValue={value} {...formInfo} />
      </div>
    );
  };

  renderGridItem = (grid, curValue, keyInfo, template) => {
    const { visibleFields, key, name } = grid;
    if (template !== undefined) {
      const gridItemRows = this.makeRowGroup(visibleFields, []);
      return Object.keys(gridItemRows || {}).map(row => {
        const { data } = gridItemRows[row];
        const lastItem = data[data.length - 1];
        const content = data.map(field => {
          const formInfo = {
            ...{
              key: field.key,
              value: curValue[field.key].value,
              readonly: true,
              template: true,
              ratio: { smXRatio: xRatio, smYRatio: yRatio },
            },
          };
          const newKeyInfo = {
            ...keyInfo,
            childKey: field.key,
            isGrid: true,
            gridName: name,
            domKey: `${key}${keyInfo.index}${field.key}`,
          };
          return (
            <div
              style={{
                // position: field.base ? 'relative' : 'absolute',
                // minHeight: `${field.row * yRatio}px`,
                // width: `${field.col * xRatio}px`,
                position: 'absolute',
                top: `${(field.y - row) * yRatio}px`,
                left: `${field.x * xRatio}px`,
              }}
              key={field.key}
            >
              {this.renderFormItem(field, formInfo, newKeyInfo)}
            </div>
          );
        });
        return (
          <div
            key={row}
            style={
              template
                ? {
                    position: 'relative',
                    height: `${(lastItem.y + lastItem.row - data[0].y) * yRatio}px`,
                  }
                : null
            }
          >
            {content}
          </div>
        );
      });
    }
    const forms = visibleFields.map(field => {
      const formInfo = {
        ...{
          key: field.key,
          value: curValue[field.key].value,
          readonly: true,
          ratio: { smXRatio: xRatio, smYRatio: yRatio },
        },
      };
      const newKeyInfo = {
        ...keyInfo,
        childKey: field.key,
        isGrid: true,
        gridName: name,
        domKey: `${key}${keyInfo.index}${field.key}`,
      };
      return this.renderFormItem(field, formInfo, newKeyInfo);
    });

    return forms;
  };

  renderRowsItem = rows =>
    Object.keys(rows || {}).map(row => {
      const items = rows[row];
      const { data, isGrid } = items;
      const content = this.renderFormContent(data, row);
      const lastItem = data[data.length - 1];
      return (
        <div
          key={row}
          style={{
            position: 'relative',
            width: !isGrid ? `${20 * xRatio}px` : `${data[0].col * xRatio}px`,
            height: !isGrid ? `${(lastItem.y + lastItem.row - data[0].y) * yRatio}px` : 'auto',
          }}
        >
          {content}
        </div>
      );
    });

  renderFormContent = (items, row) => {
    // const items = this.visibleForm.concat(this.availableGridItem);
    const newForm = items.map(item => {
      const { formData } = this.state;
      const curValue = formData[item.key];
      if (item.visibleFields) {
        // 如果是列表控件
        return (
          <div key={item.key} style={{ width: row !== undefined ? 'auto' : '482px' }}>
            <div className={style.grid_name}>{item.name}</div>
            <div>
              {curValue.value.map((itemFormData, i) => {
                const keyInfo = {
                  gridKey: item.key,
                  childKey: itemFormData,
                  index: i,
                };
                const key = `${itemFormData.key}${i}`;
                const content = this.renderGridItem(item, { ...itemFormData }, keyInfo, row);
                return (
                  <div className={style.grid_content} key={key}>
                    {content}
                  </div>
                );
              })}
            </div>
          </div>
        );
      }
      const keyInfo = {
        formKey: item.key,
        domKey: item.key,
        name: item.name,
      };
      // return this.renderFormItem(item, curValue || {}, keyInfo);
      return (
        <div
          key={item.key}
          style={
            row !== undefined
              ? {
                  // position: item.base ? 'relative' : 'absolute',
                  position: 'absolute',
                  // minHeight: `${item.row * yRatio}px`,
                  // width: `${item.col * xRatio}px`,
                  top: `${(item.y - row) * yRatio}px`,
                  left: `${item.x * xRatio}px`,
                }
              : {}
          }
        >
          {this.renderFormItem(
            item,
            {
              ...(curValue || {}),
              template: !(row === undefined),
              ratio: { smXRatio: xRatio, smYRatio: yRatio },
            },
            keyInfo
          )}
        </div>
      );
    });
    return newForm;
  };

  render() {
    // const newForm = this.state.startflow ? this.renderFormContent() : null;
    // return <div>{newForm}</div>;
    if (!this.state.startflow) {
      return null;
    }
    let newForm = null;
    if (this.props.template) {
      newForm = this.renderRowsItem(this.rows);
    } else newForm = this.renderFormContent(this.visibleForm.concat(this.availableGridItem));
    return <div>{newForm}</div>;
  }
}
export default EditForm;
