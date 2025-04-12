import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

import templateConfig from '../../../public/template.config.json';
import { TempJSONService } from '../excel-reader/temp-json.service';

@Component({
  selector: 'app-template-selector',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule
  ],
  templateUrl: './template-selector.component.html',
  styleUrl: './template-selector.component.css'
})
export class TemplateSelectorComponent {

  public templateArray: Array<any> = templateConfig;

  constructor(
    private http: HttpClient,
    private tmpJSONService: TempJSONService
  ) { }

  public select(event: any) {

    const path = event.value;
    this.http.get(`/${path}`).subscribe(x => {
      console.log('現在是誰', x);
      this.tmpJSONService.genTemplateData(x);
    });

  }

}
