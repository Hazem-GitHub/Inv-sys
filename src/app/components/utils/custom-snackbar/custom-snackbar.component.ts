import { Component, OnInit, Inject } from '@angular/core';
import {MAT_SNACK_BAR_DATA} from '@angular/material/snack-bar';
/*Router */
import { Router } from '@angular/router';

@Component({
  selector: 'app-custom-snackbar',
  templateUrl: './custom-snackbar.component.html',
  styleUrls: ['./custom-snackbar.component.scss']
})
export class CustomSnackbarComponent implements OnInit {

  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: any, private router: Router) { }

  ngOnInit(): void {
    console.log(this.data);
  }

  goToRoute(): void{
    this.router.navigateByUrl(this.data.route);
    this.data.snack.dismiss();
  }

  dismissSnackbar(): void{
    this.data.snack.dismiss();
  }

}
