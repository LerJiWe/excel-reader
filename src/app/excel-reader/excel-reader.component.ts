import { Component, inject, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button'
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import * as XLSX from 'xlsx';

import { ExcelDataService } from './excel-data.service';
import { TempJSONService } from './temp-json.service';

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

  // 自己塞資料
  public showData: any = [[1, 2], [3, 4]];

  public selectedCell: Cell = { rIndex: 0, cIndex: 0, content: '', rowspan: 0, colspan: 0 };

  // 剪貼簿
  // 彈窗相關
  readonly dialog = inject(MatDialog);

  // 剪貼簿的值
  public clipboardValue: string = "";

  constructor(
    private excelDataSvc: ExcelDataService,
    private tmpJSONService: TempJSONService) {
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

      this.tabs = this.excelDataSvc.getTabs();
    };

    await reader.readAsArrayBuffer(target.files[0]);

    this.prepareData(this.excelDataSvc.getData());
  }




  getColSpan(rowIndex: number, colIndex: number) {
    const merge = this.excelDataSvc.getMerges().find(m => m.s.r == rowIndex && m.s.c == colIndex);
    return merge ? merge.e.c - merge.s.c + 1 : 1;
  }
  getRowSpan(rowIndex: number, colIndex: number) {
    const merge = this.excelDataSvc.getMerges().find(m => m.s.r == rowIndex && m.s.c == colIndex);
    return merge ? merge.e.r - merge.s.r + 1 : 1;
  }

  private prepareData(rowData: string[][]) {
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

      this.showData = JSON.parse(JSON.stringify(result));
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
    // console.log('換頁籤', $event);
    let index = $event.index;
    this.excelDataSvc.changeSheet(index);
    this.prepareData(this.excelDataSvc.getData());
  }

  genJSON() {
    let tempJSON: any = {};
    tempJSON = this.tmpJSONService.genResultJSON();
    this.clipboardValue = JSON.stringify(tempJSON);
  }

}

type Cell = {
  rIndex: number;
  rowspan: number;
  cIndex: number;
  colspan: number;
  content: string;
}
