import { Injectable } from '@angular/core';
import { ExcelDataService } from './excel-data.service';

@Injectable({
  providedIn: 'root'
})
export class TempJSONService {

  private templateData: Array<Template> = [];

  constructor(private excelDataSvc: ExcelDataService) {
  }

  public genTemplateData(template: any) {
    this.templateData = template || [];
  }

  genResultJSON() {
    let tempJSON: any = {};
    this.templateData.forEach(x => {
      tempJSON[x.key] = this.parseTemplate(x);
    });
    return tempJSON;
  }

  private parseTemplate(x: Template) {
    switch (x.type) {
      case 'string':
        return this.genStr(<string>(x.value));
      case 'number':
        return this.genNum(<string>(x.value));
      case 'obj':
        return this.genObj(x.obj);
      case 'objArray':
        let tempValue: any = this.genObjArray(x.array);
        return tempValue;
    }
  }

  private genStr(str: string) {
    // 第一步：先處理函數 (IfNEq)，這時裡面的參數可能還帶著 {{J87}}
    const stage1 = str.replace(/IfNEq<<([\s\S]*?)>>/g, (match, content) => {
      // 這裡 content 是 "{{J87}},{{M87}},達成,不可用,"
      const args = content.split(',');

      // 呼叫 IfNEq，並在 IfNEq 內部去解析變數
      return this.IfNEq(match, ...args);
    });

    // 第二步：處理剩下的、或是 IfNEq 吐出來字串中的變數
    return this.replaceVariables(stage1);
  }

  // 提取出來的變數替換邏輯
  private replaceVariables(str: string): string {
    return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      let r = this.getValue(key);
      return typeof r === 'string' ? r.trim() : r;
    });
  }

  private genNum(str: string) {
    let tempStr = this.genStr(str);
    return Number(tempStr);
  }

  private genObj(child: BasicTemplate[]) {
    let result: any = {};

    child.forEach(obj => {
      result[obj.key] = this.parseTemplate(obj);
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
    // console.log('colNumArray', colNumArray);
    // console.log('rolNumArray', rolNumArray);
    let colNum = this.engToNumber(colNumArray[0] || '') - 1;
    let rolNum = Number(rolNumArray[0] || '') - 1;

    return this.excelDataSvc.getData()[rolNum][colNum];
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

  private IfNEq(match: string, ...args: string[]): string {
    // 假設參數一和二是要比較的對象
    // 我們先把它們從 {{J87}} 轉成真實的值
    const val1 = this.replaceVariables(args[0]);
    const val2 = this.replaceVariables(args[1]);
    const resultIfTrue = args[2]; // 第三個參數是達成時要輸出的內容
    const resultIfFalse = args[3] || ''; // 第四個參數是未達成時（選填）

    if (val1 !== val2) {
      // 如果不相等，回傳結果。注意：結果可能也包含變數，所以也要解析
      return this.replaceVariables(resultIfTrue);
    } else {
      return this.replaceVariables(resultIfFalse);
    }
  }

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
  type: 'string' | 'number';
  value: string;
}
