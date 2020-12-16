import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PageTitleService {

  private titleSource = new BehaviorSubject('Title');
  currentTitle = this.titleSource.asObservable();
  private iconSource = new BehaviorSubject('Icon');
  currentIcon = this.iconSource.asObservable();

  constructor() { }

  getTitle(): Observable<string> {
    return this.currentTitle;
  }
  changeTitle(title: string): void {
    this.titleSource.next(title);
  }
  getIcon(): Observable<string> {
    return this.currentIcon;
  }
  changeIcon(icon: string): void {
    this.iconSource.next(icon);
  }

}