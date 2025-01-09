import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

type AOA = any[][];

@Injectable({
  providedIn: 'root'
})
export class ExcelDataService {

  private workBook: XLSX.WorkBook | undefined = undefined;
  private sheetNames: string[] = [];
  private workSheet: XLSX.WorkSheet = [];
  constructor() { }

  public changeSheet(index: number) {
    let sheetName = this.sheetNames[index];
    if (this.workBook !== undefined) {
      this.workSheet = this.workBook.Sheets[sheetName];
    } else {
      this.workSheet = [];
    }

  }

  // 灌資料
  public setData(bstr: string) {
    this.workBook = XLSX.read(bstr, { type: 'binary' });
    this.sheetNames = this.workBook.SheetNames;
    this.workSheet = this.workBook.Sheets[this.sheetNames[0]];
  }

  public getTabs() {
    return this.sheetNames.map(x => { return { label: x }; });
  }

  public getSheet(index: number): XLSX.WorkSheet {
    let sheetName = this.sheetNames[index];
    if (this.workBook !== undefined) {
      return this.workBook.Sheets[sheetName];
    } else {
      return [];
    }
  }


  public getData() {
    // this.changeSheet(index);
    const range = XLSX.utils.decode_range(this.workSheet['!ref'] || '');
    range.s.c = 0;
    range.s.r = 0;

    this.workSheet['!ref'] = XLSX.utils.encode_range(range);
    return <AOA>(XLSX.utils.sheet_to_json(this.workSheet, { header: 1, blankrows: true, defval: '-', skipHidden: false }));
  }

  public getMerges() {
    let merges = this.workSheet['!merges'] || [];
    merges = merges.sort((a, b) => a.s.c - b.s.c);
    return merges;
  }


}
