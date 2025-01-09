import { Routes } from '@angular/router';
import { ExcelReaderComponent } from './excel-reader/excel-reader.component';
import { TestRegComponent } from './test-reg/test-reg.component';

export const routes: Routes = [
  { path: '', component: ExcelReaderComponent },
  { path: 'test-reg', component: TestRegComponent },
];
