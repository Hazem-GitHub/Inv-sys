import { Component, Input, OnInit } from '@angular/core';
import { PageTitleService } from './services/page-title.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  pageTitle: string;
  pageIcon: string;

  constructor(private pageTitleService: PageTitleService){
    this.pageTitleService.currentTitle.subscribe(title => this.pageTitle = title);
    this.pageTitleService.currentIcon.subscribe(icon => this.pageIcon = icon);
  }

  ngOnInit(): void {
  }

}
