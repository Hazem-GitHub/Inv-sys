import { Component, OnInit } from '@angular/core';
import { PageTitleService } from '../../services/page-title.service';

@Component({
  selector: 'app-lost',
  templateUrl: './lost.component.html',
  styleUrls: ['./lost.component.scss']
})
export class LostComponent implements OnInit {
  pageTitle: string = 'Lost';
  pageIcon: string = 'fa-times';

  constructor(private pageTitleService: PageTitleService) {
    this.pageTitleService.changeTitle(this.pageTitle);
    this.pageTitleService.changeIcon(this.pageIcon);
  }

  ngOnInit(): void {
    
  }
}
