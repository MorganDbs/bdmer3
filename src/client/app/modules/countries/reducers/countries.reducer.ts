import { CountriesAction, CountryAction } from '../actions/index';
import { ICountriesState, countriesInitialState } from '../states/index';
import { Country } from '../models/country';

export function countriesReducer(
  state: ICountriesState = countriesInitialState,
  action: CountriesAction.Actions | CountryAction.Actions
): ICountriesState {
  switch (action.type) {
    case CountriesAction.ActionTypes.LOAD: {
      return {
        ...state,
        loading: true,
      };
    }

    case CountriesAction.ActionTypes.INITIALIZED: {
      const list = action.payload;
      return {
        ...state,
        countryList: list
      };
    }

    case CountriesAction.ActionTypes.LOAD_SUCCESS: {      
      const countries = action.payload;

      const newCountries = countries.filter(country => state.ids.includes(country._id)?false:country);

      const newCountryIds = newCountries.map(country => country._id);
      
      return {
        ...state,
        ids: [...state.ids, ...newCountryIds],
        entities: [...state.entities, ...newCountries]
      };
      
    }

    case CountriesAction.ActionTypes.ADD_COUNTRY_SUCCESS: {
      const country = action.payload;
      console.log(country);
      if (state.ids.indexOf(country.id) > -1) {
        return {
          ...state,
          error: null
        }
      }

      return {
        ...state,
        ids: [...state.ids, country.id],
        error: null
      };
    }

    case CountryAction.ActionTypes.ADD_USER_SUCCESS:
    case CountryAction.ActionTypes.REMOVE_USER_SUCCESS:
    {
      const updatedCountry = action.payload;
      console.log(updatedCountry);
      const countries = state.entities.filter(country => (country._id===updatedCountry._id));
      const countryToUpdate=countries && countries[0];
      console.log(countryToUpdate);
      if((updatedCountry.users && !countryToUpdate) || updatedCountry.users.length===countryToUpdate.users.length){
        return state;  
      } else if(updatedCountry.users.length!==countryToUpdate.users.length) {
        return {
          ...state,
          entities: [state.entities.filter(country => state.ids.includes(updatedCountry._id)?false:country),updatedCountry],
          error: null
        };
      }
      
    }

    case CountriesAction.ActionTypes.REMOVE_COUNTRY_FAIL:
    case CountriesAction.ActionTypes.ADD_COUNTRY_FAIL:
    {     
      console.log("erreur");
      return {
        ...state,
        error: action.payload
      }
    }

    case CountriesAction.ActionTypes.REMOVE_COUNTRY_SUCCESS:
     {
      const country = action.payload;

      return {
        ...state,
        entities: state.entities.filter(country => state.ids.includes(country._id)?false:country),
        ids: state.ids.filter(id => id !== country._id),
        error: null

      };
    }

    default: {
      return state;
    }
  }
}

