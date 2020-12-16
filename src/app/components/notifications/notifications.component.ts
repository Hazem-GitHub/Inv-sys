import { Component, OnInit } from '@angular/core';
import { PageTitleService } from '../../services/page-title.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  pageTitle: string = 'Notifications';
  pageIcon: string = 'fa-bell';

  constructor(private pageTitleService: PageTitleService) {
    this.pageTitleService.changeTitle(this.pageTitle);
    this.pageTitleService.changeIcon(this.pageIcon);
  }

  ngOnInit(): void {
    
  }

}
