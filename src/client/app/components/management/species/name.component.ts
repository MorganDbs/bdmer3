import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';


@Component({
  moduleId: module.id,
  selector: 'bt-name',
  template: `
    <md-card-content [formGroup]="nameForm">
      <md-input-container>
        <input type="text" mdInput placeholder="Code language" formControlName="lang" required>
        <div class="hint">Ex: FR</div>
      </md-input-container>
          
      <md-input-container>
        <input type="text" mdInput placeholder="Nom vernaculaire" formControlName="name" required>
        <div class="hint">Ex: Holothurie brune</div>    
      </md-input-container>
    </md-card-content>
  `,
  styles: [
    `
    :host {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
    }
    md-input-container {
      padding-left: 1em;
    }
    input {
      width: 300px;
    }
    .hint {
      /* Position the hint */
      position: absolute;
      left: 2px;
      right: auto;
      bottom: 7px;
      /* Copy styles from ng-messages */
      font-size: 12px;
      line-height: 14px;
      transition: all 0.3s cubic-bezier(0.55, 0, 0.55, 0.2);
      /* Set our own color */
      color: grey; 
    }
  `,
  ],
})
export class NameComponent {
    @Input('group')
    public nameForm: FormGroup;
}