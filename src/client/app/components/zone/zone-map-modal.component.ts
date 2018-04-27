import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  template: `
    <img [src]="data" />
    <button mat-button type="button" (click)="dialogRef.close()">Close</button>
  `,
  styles: [
  	`
  	img{
  		width: 100%;
  		height: auto;
  	}
  	`
  ],
})
export class zoneMapModal {

  constructor(private dialogRef: MatDialogRef<zoneMapModal>, private dialog: MatDialog, @Inject(MAT_DIALOG_DATA) private data) {}
}