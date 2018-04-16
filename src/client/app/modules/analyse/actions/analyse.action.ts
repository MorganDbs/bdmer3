import { Action } from '@ngrx/store';
import { User, Country } from '../../countries/models/country';
import { Platform, Zone, Survey, Transect } from '../../datas/models/platform';
import { Species } from '../../datas/models/species';
import { Method } from '../models/analyse';
import { type } from '../../core/utils/index';
  
export namespace AnalyseAction {

  export const AUTH: string = 'AnalyseAction';

  export interface IAnalyseActions {
    SELECT_COUNTRY: string;
    SELECT_SURVEYS: string;
    SELECT_ZONES: string;
    SELECT_TRANSECTS: string;
    SELECT_SPECIES: string;
    SELECT_METHOD: string;
    ANALYSE: string;
    ANALYSE_SUCCESS: string;
    ANALYSE_FAILURE: string;
  }

  export const ActionTypes: IAnalyseActions = {
    SELECT_COUNTRY : type('[Analyse] Select country'),
    SELECT_SURVEYS : type('[Analyse] Select Surveys'),
    SELECT_ZONES : type('[Analyse] Select Zones'),
    SELECT_TRANSECTS : type('[Analyse] Select Transects'),
    SELECT_SPECIES : type('[Analyse] Select Species'),
    SELECT_METHOD : type('[Analyse] Select method'),
    ANALYSE: type('[Analyse] Start analyse'),
    ANALYSE_SUCCESS : type('[Analyse] Analyse Success'),
    ANALYSE_FAILURE : type('[Analyse] Analyse Failure')
  }
export class SelectCountry implements Action {
  readonly type = ActionTypes.SELECT_COUNTRY;

  constructor(public payload: Country) {}
}

export class SelectSurveys implements Action {
  readonly type = ActionTypes.SELECT_SURVEYS;

  constructor(public payload: Survey[] ) {}
}

export class SelectZones implements Action {
  readonly type = ActionTypes.SELECT_ZONES;

  constructor(public payload: Zone[][]) {}
}

export class SelectTransects implements Action {
  readonly type = ActionTypes.SELECT_TRANSECTS;
  constructor(public payload: Transect[][]) {}
}

export class SelectSpecies implements Action {
  readonly type = ActionTypes.SELECT_SPECIES;
  
  constructor(public payload: Species[][]) {}
}

export class SelectMethod implements Action {
  readonly type = ActionTypes.SELECT_METHOD;

  constructor(public payload: Method) {}
}

export class Analyse implements Action {
  readonly type = ActionTypes.ANALYSE;

  constructor(public payload: any) {}
}

export class AnalyseSuccess implements Action {
  readonly type = ActionTypes.ANALYSE_SUCCESS;

  constructor(public payload: any) {}
}

export class AnalyseFailure implements Action {
  readonly type = ActionTypes.ANALYSE_FAILURE;

  constructor(public payload: any) {}
}

export type Actions =
  | SelectCountry
  | SelectSurveys
  | SelectZones
  | SelectTransects
  | SelectSpecies
  | SelectMethod
  | Analyse
  | AnalyseSuccess
  | AnalyseFailure;
}