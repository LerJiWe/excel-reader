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

  /**
   * 目前先帶值
   * 再處理自定義函式 EX: IF<<內容>>
   * @param str
   */
  private genStr(str: string) {
    const replaceAction = (match: string, key: string) => {
      // console.log('match', match);
      // console.log('key', key);
      let r = this.getValue(key);
      return r;
    }
    return str
      .replace(/\{\{(\w+)\}\}/g, replaceAction)
      .replace(/IfNEq<<(([\w\s\u4e00-\u9fa5\<\=\:\-]+\,)+)>>/g, this.IfNEq);
  }
  //CC<={{V69}} 藝術 {{J69}},

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

  // 第一個跟第二個參數如果不相等，就回傳第三個否則回傳空字串
  private IfNEq(match: string, key: string) {
    console.log('ifeq執行');
    console.log('key', key);
    let paramsArray = key.split(',');
    console.log('params', paramsArray);

    return paramsArray[0] === paramsArray[1] ?
      "" : paramsArray[2];

    // while (true) {
    //   let n: number = key.search(/(\w+\,)/g)
    //   console.log('nnn', n)
    //   if (n === -1) {
    //     console.log("出去囉")
    //     break;
    //   }
    //   let token = key.substring(0, n + 1);
    //   console.log('token', token);
    //   key = key.substring(n + 2);
    //   console.log('new key', key);
    // }

    return match;
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
