import { Component, OnInit } from '@angular/core';
import { PageTitleService } from '../../services/page-title.service';

@Component({
  selector: 'app-maintenance',
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.scss']
})
export class MaintenanceComponent implements OnInit {
  pageTitle: string = 'Maintenance';
  pageIcon: string = 'fa-sign-in';

  constructor(private pageTitleService: PageTitleService) {
    this.pageTitleService.changeTitle(this.pageTitle);
    this.pageTitleService.changeIcon(this.pageIcon);
  }

  ngOnInit(): void {
    
  }

}
