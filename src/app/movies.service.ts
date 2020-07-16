import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { MOVIES } from './movies.db';

@Injectable({
  providedIn: 'root'
})
export class MoviesService {

  constructor() { }

  getMovies(
    searchBy = '',
    genre = '',
    premiereYear = '',
    sortBy: 'name' | 'season' | 'premiere' | '' = '',
    ascDesc: 'asc' | 'desc' = 'asc',
    page = 1,
    itemsPerPage = 5
  ) {

    // Copy all movies
    let result = MOVIES.slice(0);

    // collect all genres and all premiere years
    const allGenres = [];

    const allPremiereYears = [];

    for (const movie of result) {

      for (const movieGenre of movie.genre) {

        if (!allGenres.includes(movieGenre)) {

          allGenres.push(movieGenre);
        }
      }

      const year = movie.premiere.substr(0, 4);

      if (!allPremiereYears.includes(year)) {

        allPremiereYears.push(year);
      }
    }

    allGenres.sort();

    allPremiereYears.sort();

    // Filter by search keyword
    if (searchBy) {

      searchBy = searchBy.toLowerCase();

      result = result.filter(movie => movie.name.toLowerCase().includes(searchBy));
    }

    // Filter by genre
    if (genre) {

      result = result.filter(movie => movie.genre.includes(genre));
    }

    // Filter by premiere year
    if (premiereYear) {

      result = result.filter(movie => movie.premiere.substr(0, 4) === premiereYear);
    }

    // Sort the result
    if (sortBy && ['name', 'season', 'premiere'].includes(sortBy)) {

      if (ascDesc !== 'asc' && ascDesc !== 'desc') {

        ascDesc = 'asc';
      }

      let comparator;

      if (sortBy === 'name') {

        comparator = ascDesc === 'asc' ?
          (m1, m2) => m1.name.localeCompare(m2.name) :
          (m1, m2) => m2.name.localeCompare(m1.name);

      } else if (sortBy === 'season') {

        comparator = ascDesc === 'asc' ?
          (m1, m2) => m1.season - m2.season :
          (m1, m2) => m2.season - m1.season;

      } else {

        comparator = ascDesc === 'asc' ?
          (m1, m2) => m1.premiere === m2.premiere ? 0 : (m1.premiere > m2.premiere ? 1 : -1) :
          (m1, m2) => m1.premiere === m2.premiere ? 0 : (m1.premiere > m2.premiere ? -1 : 1);
      }

      result.sort(comparator);
    }

    const totalCount = result.length;

    if (![5, 10, 25].includes(itemsPerPage)) {

      itemsPerPage = 5;
    }

    if (!Number.isInteger(page) || page < 1) {

      page = 1;
    }

    // Get necessary page
    result = result.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    // If there is no movies for passed page number - get them for the first one
    if (!result.length) {

      result = result.slice(0, itemsPerPage);
    }

    return of({
      page,
      totalCount,
      itemsPerPage,
      searchBy,
      genre,
      premiereYear,
      sortBy,
      ascDesc,
      result,
      allGenres,
      allPremiereYears
    });
  }
}
