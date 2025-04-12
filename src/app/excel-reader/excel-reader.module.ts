import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatButtonModule } from '@angular/material/button'
import { MatDialogModule } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTableModule } from '@angular/material/table'

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    FormsModule,
    ClipboardModule,
    MatButtonModule,
    MatDialogModule,
    MatGridListModule,
    MatTableModule
  ]
})
export class ExcelReaderModule { }
