import { Component, inject, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button'
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import * as XLSX from 'xlsx';

import template from '../../../public/coc7e.template.json';
import { ExcelDataService } from './excel-data.service';

type AOA = any[][];

@Component({
  selector: 'app-excel-reader',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    ClipboardModule,
    MatDialogModule,
    MatTabsModule
  ],
  templateUrl: './excel-reader.component.html',
  styleUrl: './excel-reader.component.css'
})
export class ExcelReaderComponent {

  // tabs 相關
  public tabs = [{ label: 'A' }, { label: 'B' }, { label: 'C' }];


  // 讀取的原始資料放這邊
  public data: AOA = [];

  // 處理合併儲存格
  public merges: any[] = [];

  // 自己塞資料
  public showData: any = [[1, 2], [3, 4]];

  public selectedCell: Cell = { rIndex: 0, cIndex: 0, content: '', rowspan: 0, colspan: 0 };

  // 剪貼簿
  // 彈窗相關
  readonly dialog = inject(MatDialog);

  // 剪貼簿的值
  public clipboardValue: string = "";

  private testData: Array<Template> = [];
  private testData0: Array<ObjTemplate | ArrayTemplate | BasicTemplate> = [];

  constructor(private excelDataSvc: ExcelDataService) {
    this.testData = (<any>template) || [];
  }

  // 上傳檔案
  async onFileChange(evt: any) {
    const target: DataTransfer = <DataTransfer>(evt.target);

    if (target.files.length !== 1) {
      throw new Error('Cannot use multiple files');
    }

    const reader: FileReader = new FileReader();

    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      this.excelDataSvc.setData(bstr);
      // const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

      // this.tabs = wb.SheetNames.map(x => { return { label: x } });
      this.tabs = this.excelDataSvc.getTabs();

      // const wsname: string = wb.SheetNames[0];
      // const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      /*
      const ws: XLSX.WorkSheet = this.excelDataSvc.getSheet(0)

      const range = XLSX.utils.decode_range(ws['!ref'] || '');
      range.s.c = 0;
      range.s.r = 0;
      ws['!ref'] = XLSX.utils.encode_range(range);

      this.merges = ws['!merges'] || [];
      this.merges = this.merges.sort((a, b) => a.s.c - b.s.c);
      */



      // this.data = <AOA>(XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: true, defval: '-', skipHidden: false }));
      // console.log('data', this.data);
      // console.log('merges', this.merges);
      // const cols = ws['!cols'] || [];
      // console.log('cols', cols);
    };

    await reader.readAsArrayBuffer(target.files[0]);

    this.prepareData(this.excelDataSvc.getData());
    // this.showData = JSON.parse(JSON.stringify(tempData))

  }




  getColSpan(rowIndex: number, colIndex: number) {
    // const merge = this.merges.find(m => m.s.r == rowIndex && m.s.c == colIndex);
    const merge = this.excelDataSvc.getMerges().find(m => m.s.r == rowIndex && m.s.c == colIndex);

    return merge ? merge.e.c - merge.s.c + 1 : 1;
  }
  getRowSpan(rowIndex: number, colIndex: number) {
    // const merge = this.merges.find(m => m.s.r == rowIndex && m.s.c == colIndex);
    const merge = this.excelDataSvc.getMerges().find(m => m.s.r == rowIndex && m.s.c == colIndex);
    return merge ? merge.e.r - merge.s.r + 1 : 1;
  }

  private prepareData(rowData: string[][]) {
    // console.log('prepareData');
    let result: AOA = []
    if (rowData.length == 0) {
      // console.log('rowData undefined');
      setTimeout(() => {
        this.prepareData(this.excelDataSvc.getData());
      }, 1000);
    } else {

      /**
       * r2c3
       * 用 rowIndex 跟 cellIndex 的值去組合
       * 假設 0,0 然後 colspan 是 3
       * 3 - 1 = 2 產生 r0c1, r0c2
       * rowspan 是 2
       * 2 - 1 = 1 產生 r1c0, r1c1, r1c2
       */
      const skipCellSet: Set<string> = new Set<string>();

      rowData.forEach((row, rowIndex) => {
        // console.log('row', row);
        let tempRow: Cell[] = [];
        row.forEach((cell, cellIndex) => {
          // this.getColSpan(rowIndex, cellIndex);
          // this.getRowSpan(rowIndex, cellIndex);
          const rowspan = this.getRowSpan(rowIndex, cellIndex);
          const colspan = this.getColSpan(rowIndex, cellIndex);
          if (rowspan > 1 || colspan > 1) {
            // console.log('cell', cell);
            let r = this.genSkipCellSet(rowIndex, cellIndex, rowspan, colspan);
            r.forEach(x => {
              skipCellSet.add(x)
              // console.log('x', x);
            });
            // console.log('skipR', r);
          }

          if (!skipCellSet.has(`r${rowIndex}c${cellIndex}`)) {
            let tempData: Cell = {
              rIndex: rowIndex,
              rowspan: rowspan,
              cIndex: cellIndex,
              colspan: colspan,
              content: cell
            };
            tempRow.push(tempData);
          }
        });

        result.push(tempRow);
      });
      // console.log('result', result);
      // console.log('skip', skipCellSet);

      this.showData = JSON.parse(JSON.stringify(result));
      // 清空
      // this.data = [];
    }
  }
  //23, 8, 3, 1
  private genSkipCellSet(rI: number, cI: number, rS: number, cS: number) {
    const R = [];
    for (let r = 0; r < rS; r++) {
      for (let c = 0; c < cS; c++) {
        R.push(`r${rI + r}c${cI + c}`);
      }
    }
    return R.slice(1);
  }

  selectCell(cell: Cell) {

    this.selectedCell = JSON.parse(JSON.stringify(cell));
  }

  openDialog(templateRef: TemplateRef<any>) {
    const dialogRef = this.dialog.open(templateRef);
  }

  changeTab($event: any) {
    console.log('換頁籤', $event);
    let index = $event.index;
    this.excelDataSvc.changeSheet(index);
    this.prepareData(this.excelDataSvc.getData());
  }

  genJSON() {
    // console.log('genJSON');
    let tempJSON: any = {};
    this.testData.forEach(x => {
      tempJSON[x.key] = this.parseJSON(x);

      // switch (x.type) {
      //   case 'string':
      //   case 'number':
      //     // let tempValue: string = this.genStr(<string>(x.value));
      //     console.log('x', x);
      //     tempJSON[x.key] = this.genStr(<string>(x.value));
      //     break;
      //   case 'obj':
      //     break;
      //   case 'objArray':
      //     let tempValue: any = this.genObjArray(x.child);
      //     tempJSON[x.key] = tempValue;
      //     break;
      // }
      // tempJSON[x.key] = x.value;
    });
    this.clipboardValue = JSON.stringify(tempJSON);
  }

  private parseJSON(x: Template) {
    console.log('parseJSON', x);
    switch (x.type) {
      case 'string':
        // let tempValue: string = this.genStr(<string>(x.value));
        console.log('x', x);
        return this.genStr(<string>(x.value));
        break;
      case 'obj':
        return this.genObj(x.obj);
        break;
      case 'objArray':
        let tempValue: any = this.genObjArray(x.array);
        return tempValue;
        break;
    }
  }

  private genStr(str: string) {

    const replaceAction = (match: string, key: string) => {
      console.log('match', match);
      console.log('key', key);
      let r = this.getValue(key);
      return r;
    }

    return str.replace(/\{\{(\w+)\}\}/g, replaceAction);
    // 原本的 應該移到 getValue
    if (str.indexOf('|') == -1) {
      return str;
    }
    let tempArray = str.split('|');
    let colNum = this.engToNumber(tempArray[0]) - 1;
    let rolNum = Number(tempArray[1]) - 1;
    // console.log('this.data', this.data);
    return this.data[rolNum][colNum];
  }

  private genObj(child: BasicTemplate[]) {
    let result: any = {};

    child.forEach(obj => {
      result[obj.key] = this.parseJSON(obj);
    });
    return result;
  }

  private genObjArray(child: BasicTemplate[][]) {

    let result: Array<any> = [];
    child.forEach(array => {
      let tempObj: any = {};
      array.forEach(x => {
        tempObj[x.key] = this.genStr(x.value);
      });
      result.push(tempObj);
    });
    return result;
  }

  private getValue(str: string) {

    let colNumArray = str.match(/[a-zA-Z]+/g) || [];
    let rolNumArray = str.match(/\d+/g) || [];
    console.log('colNumArray', colNumArray);
    console.log('rolNumArray', rolNumArray);
    let colNum = this.engToNumber(colNumArray[0] || '') - 1;
    let rolNum = Number(rolNumArray[0] || '') - 1;

    return this.excelDataSvc.getData()[rolNum][colNum];
    // return this.data[rolNum][colNum];
  }

  private engToNumber(eng: string) {
    // 'A'.charCodeAt() 是 65
    let power = eng.length - 1;
    let result = 0;
    for (let i = 0; i < eng.length; i++) {
      let num = eng[i].toUpperCase().charCodeAt(0) - 64;
      result += num * (26 ** power);
      power--;
    }
    return result;
  }



}

type Cell = {
  rIndex: number;
  rowspan: number;
  cIndex: number;
  colspan: number;
  content: string;
}

type Template0 = {
  key: string;
  type: string;
  value: string;
  obj: BasicTemplate[];
  array: BasicTemplate[][];
  child: BasicTemplate[][];
}

type Template = ObjTemplate | ArrayTemplate | BasicTemplate;

type ObjTemplate = {
  key: string;
  type: 'obj';
  obj: BasicTemplate[];
}

type ArrayTemplate = {
  key: string;
  type: 'objArray';
  array: BasicTemplate[][];
  value: [];
}

type BasicTemplate = {
  key: string;
  type: 'string';
  value: string;
}
