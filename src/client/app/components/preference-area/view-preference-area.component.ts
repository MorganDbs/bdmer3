import { Component, OnInit, Output, Input, ChangeDetectionStrategy, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { RouterExtensions, Config } from '../../modules/core/index';
import {TranslateService} from '@ngx-translate/core';

import { IAppState } from '../../modules/ngrx/index';

import { PlatformAction } from '../../modules/datas/actions/index';
import { User } from '../../modules/countries/models/country';
import { Platform,Zone, ZonePreference } from '../../modules/datas/models/index';
import { WindowService } from '../../modules/core/services/index';

@Component({
    moduleId: module.id,
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'bc-zone-pref',
    templateUrl: 'view-preference-area.component.html',
    styleUrls: [
        'view-preference-area.component.css',
    ],
})
export class ViewPreferenceAreaComponent implements OnInit {    
    @Input() platform: Platform;
    @Input() zone: Zone;
    @Input() zonePref: ZonePreference;
    @Output() remove = new EventEmitter<any>();
    @Output() action = new EventEmitter<any>();


    constructor(private translate: TranslateService, private store: Store<IAppState>, public routerext: RouterExtensions, private windowService: WindowService) { }


    ngOnInit() {
    }


    deleteZonePref() {
        let deleteMsg = this.translate.instant('CONFIRM_DELETE_ZONEPREF');

        if (this.windowService.confirm(deleteMsg)){
            this.remove.emit(this.zonePref);
        }
    }

    actions(type: string) {
        switch (type) {
            case "zonePrefForm":
                this.action.emit(type + '/' + this.platform._id + "/" + this.zone.properties.code + '/' + this.zonePref.code);
                break;
            case "deleteZonePref":
                this.deleteZonePref();
                break;
            default:
                break;
        }

    }

    toPlatforms(){
        this.routerext.navigate(['platform']);
    }

    toPlatform(){
        this.routerext.navigate(['platform/'+this.platform.code]);
    }

    toZone(){
        this.routerext.navigate(['zone/'+this.platform.code+'/'+this.zone.properties.code]);
    }

  get thumbnailZone(): string | boolean {
      //WAIT FOR MAP
      return null;
    //return "/assets/img/"+this.zonePref.codeSpecies+".jpg"; 
  }

  get thumbnailSpecies(): string | boolean {
    return this.zonePref.picture; 
  }
}