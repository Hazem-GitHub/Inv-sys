import { Component, Input, OnInit } from '@angular/core';
import { PageTitleService } from '../../../services/page-title.service';

@Component({
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.scss']
})
export class TopNavComponent implements OnInit {
  pageTitle: string;
  pageIcon: string;
  @Input() sidenav: any;

  isNavOpened: boolean = false;

  // constructor(private pageTitleService: PageTitleService) {
  // }
  constructor( private pageTitleService: PageTitleService) {
    this.pageTitleService.currentTitle.subscribe(title => this.pageTitle = title);
    this.pageTitleService.currentIcon.subscribe(icon => this.pageIcon = icon);
  }

  ngOnInit(): void {
    // this.pageTitleService.currentTitle.subscribe(title => this.pageTitle = title);
    // this.pageTitleService.currentIcon.subscribe(icon => this.pageIcon = icon);
  }

  toggleSideNav(): void{
    this.sidenav.toggle();
    this.isNavOpened = !this.isNavOpened;
  }
}
