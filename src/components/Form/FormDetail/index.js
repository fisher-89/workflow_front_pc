/* eslint no-param-reassign:0 */

import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { last } from 'lodash';

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
import { makeMergeSort, judgeIsNothing } from '../../../utils/utils';

const yRatio = 40;
const xRatio = 60;
@connect(({ start }) => ({ startDetails: start.startDetails }))
class EditForm extends PureComponent {
  constructor(props) {
    super(props);
    const { startflow } = props;
    this.dealStartForm(startflow);
    // this.rows = this.makeFormInSameRows(this.visibleForm.concat(this.availableGridItem));
    this.rows = this.makeRows(this.visibleForm, this.visibleGrid, this.grouplist);
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
      // this.rows = this.makeRowGroup(this.visibleForm, this.availableGridItem);
      this.rows = this.makeRows(this.visibleForm, this.visibleGrid, this.grouplist);
      const newFormData = startflow ? this.initFormData() : {};
      this.setState({
        formData: newFormData,
        startflow,
      });
    }
  }

  makeRows = (fieldForm, gridForm = [], grouplist = []) => {
    const rows = {};
    fieldForm.forEach(item => {
      const { y, row } = item;
      const rowItem = rows[item.y] || [];
      rowItem.push(item);
      rows[y] = rowItem;
      if (row > 1) {
        this.mergeOtherRow(rows, y, row, item);
      }
    });
    grouplist.forEach(item => {
      const x1 = item.left;
      const y1 = item.top;
      const x2 = item.right;
      const y2 = item.bottom;
      let containRow = {};
      let containFields = [];

      Object.keys(rows).forEach(rowY => {
        const rowItem = rows[rowY];
        if (rowY - y1 > 0 && rowY - y2 < 0) {
          containRow = { ...containRow, [rowY]: rowItem };
        }
      });
      fieldForm.forEach(field => {
        const { x, y, col } = field;
        if (y - y1 > 0 && y - y2 < 0 && x - x1 >= 0 && col + x - x2 <= 0) {
          containFields = [...containFields, field];
        }
      });

      if (containFields.length) {
        const { length } = Object.keys(this.serializeRows(containRow));
        const newItem = { isGroup: true, ...item, containRow, newEndY: y1 + length + 1 };
        rows[y1] = (rows[y1] || []).concat(newItem);
        // this.mergeOtherRow(rows, y1, length + 1, newItem);
      }
    });
    return this.sliceOnGrid(rows, gridForm);
  };

  mergeOtherRow = (rows, y, row, item) => {
    let count = 1;
    while (count < row) {
      rows[y + count] = (rows[y + count] || []).concat(item);
      count += 1;
    }
  };

  serializeRows = rows => {
    const seriaRows = {};
    let i = 0;
    Object.keys(rows).forEach(row => {
      const rowItem = rows[row];
      seriaRows[i] = rowItem;
      i += 1;
    });
    return seriaRows;
  };

  sliceOnGrid = (rows, gridForm) => {
    // 以列表控件分割
    const tempRows = { ...rows };
    const sortGrids = makeMergeSort(gridForm, 'y');
    const groups = [];
    if (sortGrids.length) {
      sortGrids.forEach(grid => {
        const { y } = grid;
        let obj = {};
        Object.keys(tempRows).forEach(startY => {
          if (startY < y) {
            obj = { ...obj, [startY]: rows[startY] };
            delete tempRows[startY];
          }
        });
        groups.push({ data: obj });
        groups.push({
          isGrid: true,
          data: {
            [y]: [{ ...grid, isGrid: true }],
          },
        });
      });
      if (Object.keys(tempRows).length) {
        groups.push({ data: tempRows });
      }
    } else {
      groups.push({ data: tempRows });
    }
    return this.mapGroup(groups);
  };

  mapGroup = groups => {
    const newGruops = groups.map(item => {
      const serilize = this.serializeRows(item.data);
      return { ...item, data: this.dealSomeRow(serilize) };
    });
    return newGruops;
  };

  dealSomeRow = oldRows => {
    const newRows = {};
    Object.keys(oldRows).forEach(y => {
      const currentRow = oldRows[y];
      if (y - 0 > 0) {
        const lastY = y - 1;
        const lastRowKeys = oldRows[lastY].map(item => `${item.key}`);
        const newCurRow = currentRow.filter(item => lastRowKeys.indexOf(`${item.key}`) === -1);
        if (newCurRow.length) {
          newRows[y] = newCurRow;
        }
      } else if (currentRow.length) {
        newRows[y] = currentRow;
      }
    });
    return newRows;
  };

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
    this.grouplist = startflow.field_groups || [];

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
    this.visibleGrid = this.availableGridItem.filter(
      item => startflow.step.hidden_fields.indexOf(item.key) === -1
    );
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
      const gridItemRows = this.makeRows(visibleFields);
      return Object.keys(gridItemRows || {}).map(row => {
        const items = gridItemRows[row];
        const { data } = items;
        let content = [];
        let maxY = 0;
        let minY = 0;
        Object.keys(data).forEach(y => {
          if (y - maxY > 0) {
            maxY = y;
          }
          if (y - minY < 0) {
            minY = y;
          }
          const cont = data[y].map(field => {
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
                  position: 'absolute',
                  top: `${y * yRatio}px`,
                  left: `${field.x * xRatio}px`,
                }}
                key={field.key}
              >
                {this.renderFormItem(field, formInfo, newKeyInfo)}
              </div>
            );
          });
          content = content.concat(cont);
        });
        const lastItem = last(
          makeMergeSort(
            data[maxY].map(item => ({ ...item, bottom: row - 0 + (item.row - 0) })),
            'bottom'
          )
        );
        return (
          <div
            key={row}
            style={
              template
                ? {
                    position: 'relative',
                    height: `${(maxY - 0 + (lastItem.row - 0) - minY) * yRatio}px`,
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
          ratio: { smXRatio: xRatio, smYRatio: yRatio },
          readonly: true,
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
      let content = [];
      let maxY = 0;
      let minY = 0;
      Object.keys(data).forEach(y => {
        if (y - maxY > 0) {
          maxY = y;
        }
        if (y - minY < 0) {
          minY = y;
        }
        if (data[y]) {
          content = content.concat(this.renderFormContent(data[y], y));
        }
      });
      if (!judgeIsNothing(data[minY])) {
        return null;
      }
      const lastItem = last(
        makeMergeSort(
          data[maxY].map(item => ({ ...item, bottom: row - 0 + (item.row - 0) })),
          'bottom'
        )
      );
      const firstItem = makeMergeSort(
        data[minY].map(item => ({ ...item, bottom: row - 0 + (item.row - 0) })),
        'bottom'
      )[0];
      return (
        <div
          key={row}
          style={{
            position: 'relative',
            width: !isGrid ? `${20 * xRatio}px` : `${firstItem.col * xRatio - 1}px`,
            height: !isGrid ? `${(maxY - 0 + (lastItem.row - 0) - minY) * yRatio}px` : 'auto',
            ...(isGrid
              ? { boxSizing: 'content-box', border: '1px solid #999', marginBottom: '-1px' }
              : {}),
          }}
        >
          {content}
        </div>
      );
    });

  renderFormContent = (items, row) => {
    const newForm = items.map(item => {
      const { formData } = this.state;
      const curValue = { ...formData[item.key], readonly: true };
      if (item.visibleFields) {
        // 如果是列表控件
        return (
          <div
            key={item.key}
            className={style.grid}
            style={{ width: row !== undefined ? 'auto' : '602px', marginBottom: '9px' }}
          >
            <div className={style.grid_name}> {item.name}</div>{' '}
            {curValue.value.length ? (
              <div>
                {' '}
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
                      {' '}
                      {content}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  height: '32px',
                  lineHeight: '30px',
                  border: '1px solid #ccc',
                  textAlign: 'center',
                  width: '180px',
                  margin: '9px auto 0 auto',
                }}
              >
                {' '}
                暂无信息{' '}
              </div>
            )}
          </div>
        );
      }
      if (item.isGroup) {
        return (
          <div
            key={item.key}
            style={{
              position: 'absolute',
              top: `${row * yRatio}px`,
              left: `${item.left * xRatio}px`,
              border: '1px solid #999',
              color: '#000',
              fontWeight: 'bold',

              boxSizing: 'content-box',
              width: `${(item.right - item.left) * xRatio - 1}px`,
              height: `${(item.newEndY - item.top) * yRatio - 1}px`,
            }}
          >
            <div
              style={{
                height: `${yRatio}px`,
                borderBottom: '1px solid #999',
                textAlign: 'center',
                lineHeight: `${yRatio - 1}px`,
              }}
            >
              {item.title}
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
                  top: `${row * yRatio}px`,
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

    if (`${this.props.template}` === '1') {
      newForm = this.renderRowsItem(this.rows);
    } else newForm = this.renderFormContent(this.visibleForm.concat(this.visibleGrid));
    return <div style={{ marginLeft: '1px', marginBottom: '1px' }}> {newForm} </div>;
  }
}
export default EditForm;
