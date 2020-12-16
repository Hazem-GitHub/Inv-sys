import { Component, OnInit, EventEmitter, Output, AfterViewInit } from '@angular/core';
import { PageTitleService } from '../../services/page-title.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  pageTitle: string = 'Dashboard';
  pageIcon: string = 'fa-chart-line';

  constructor(private pageTitleService: PageTitleService) {
    this.pageTitleService.changeTitle(this.pageTitle);
    this.pageTitleService.changeIcon(this.pageIcon);
  }

  ngOnInit(): void {
    
  }

}
