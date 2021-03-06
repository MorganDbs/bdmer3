// libs
import { Component, Inject } from '@angular/core';
import { Store } from '@ngrx/store';

// app
import { Config, ILang, LogService } from '../../core/index';
import { IAppState, getLangues } from '../../ngrx/index';
import { ElectronEventService } from '../../electron/index';
import { MultilingualAction } from '../actions/index';
import { MultilingualService, Languages, LanguageViewHelper } from '../services/index';

@Component({
  moduleId: module.id,
  selector: 'lang-switcher',
  templateUrl: 'lang-switcher.component.html',
  styleUrls: ['lang-switcher.component.css'],
})
export class LangSwitcherComponent {

  public lang: string;
  public supportedLanguages: Array<ILang>;

  constructor(
    private store: Store<IAppState>,
    private log: LogService,
    @Inject(Languages) private languages,
    @Inject(LanguageViewHelper) private viewHelper
  ) {
    store.select(getLangues).subscribe(language => this.lang = language);   

    if (Config.IS_DESKTOP()) {
      // allow electron menu to talk to component
      ElectronEventService.on('changeLang').subscribe((e: any) => {
        this.changeLang({ target: { value: e.detail.value } });
      });
    }
  }

  changeLang(e: any) {
    let lang = this.supportedLanguages[0].code; // fallback to default 'en'

    if (Config.IS_MOBILE_NATIVE()) {
      if (e) {
        lang = this.supportedLanguages[e.newIndex].code;
      }
    } else if (e && e.target) {
      lang = e.target.value;
    }
    this.log.debug(`Language change: ${lang}`);
    this.store.dispatch(new MultilingualAction.ChangeAction(lang));
  }

  ngOnInit() {
    this.supportedLanguages = this.languages;
    if (Config.IS_MOBILE_NATIVE() && this.viewHelper) {
      // {N} 3.0 requires SegmentedBarItem class for items
      // when binding to SegmentedBar
      this.supportedLanguages = this.viewHelper;
    }
  }
}
