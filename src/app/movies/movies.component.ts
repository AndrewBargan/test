import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Movie } from '../movie';
import { MoviesService } from '../movies.service';

@Component({
  selector: 'app-movies',
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.css']
})
export class MoviesComponent implements OnInit, OnDestroy {

  totalCount: number;
  searchBy: string;
  searchTerm = new Subject<string>();
  genre: string;
  premiereYear: string;
  sortBy: 'name' | 'season' | 'premiere' | '' = '';
  ascDesc: 'asc' | 'desc' = 'asc';
  page: number;
  itemsPerPage: number;
  movies: Movie[] = [];
  search$;
  pagesCount = 1;
  pagesArray = [];
  allGenres = [];
  allPremiereYears = [];

  serverError = false;

  constructor(
    private moviesService: MoviesService
  ) { }

  ngOnInit(): void {

    this.search$ = this.searchTerm
      .pipe(
        // Wait 300ms after each keystroke before considering the term
        debounceTime(300),

        // Ignore new term if same as previous term
        distinctUntilChanged()
      )
      .subscribe(
        (term: string) => {

          this.searchBy = term;

          this.getMovies();
        }
      );

    this.getMovies();
  }

  ngOnDestroy(): void {

    this.search$.unsubscribe();
  }

  getMovies() {

    // Reseting 'server error message if it was shown'
    this.serverError = false;

    this.moviesService
      .getMovies(
        this.searchBy,
        this.genre,
        this.premiereYear,
        this.sortBy,
        this.ascDesc,
        this.page,
        this.itemsPerPage
      )
      .subscribe(
        res => {

          this.movies = res.result;

          this.allGenres = res.allGenres;

          this.allPremiereYears = res.allPremiereYears;

          this.page = res.page;

          this.totalCount = res.totalCount;

          this.itemsPerPage = res.itemsPerPage;

          this.pagesCount = Math.trunc(this.totalCount / this.itemsPerPage)
            + (this.totalCount % this.itemsPerPage ? 1 : 0);

          this.pagesArray = new Array(this.pagesCount);
        },
        () => this.serverError = true
      );
  }

  // Push a search term into the observable stream.
  searchTyped(event): void {

    this.searchTerm.next(event?.target?.value || '');
  }

  // Clicking a column to sort by will alternate between ascending/descending/no sorting
  sort(field: 'name' | 'season' | 'premiere') {

    // If we've received wrong value - exit
    if (!['name', 'season', 'premiere'].includes(field)) {

      return;
    }

    if (this.sortBy !== field) {

      this.sortBy = field;

      this.ascDesc = 'asc';

    } else if (this.ascDesc === 'asc') {

      this.ascDesc = 'desc';

    } else {

      this.sortBy = '';
    }

    this.page = 1;

    this.getMovies();
  }

  // ipp - stand for items per page
  changeItemsPerPage(ipp: number) {

    // If we've received wrong value or ipp didn't change - exit
    if (![5, 10, 25].includes(ipp) || ipp === this.itemsPerPage) {

      return;
    }

    this.itemsPerPage = ipp;

    this.page = 1;

    this.getMovies();
  }

  changePage(page: number) {

    if (
      !Number.isInteger(page)
      || page === this.page
      || page < 1
      || page > this.pagesCount
    ) {

      return;
    }

    this.page = page;

    this.getMovies();
  }

  genreSelected(event, genre = ''): void {

    if (!genre) {

      genre = event?.target?.value;
    }

    if (genre === 'any') {

      genre = '';
    }

    // If If we've received wrong value or genre didn't change - exit
    if (
      (genre && !this.allGenres.includes(genre))
      || genre === this.genre
    ) {

      return;
    }

    this.genre = genre;

    this.page = 1;

    this.getMovies();
  }

  premiereYearSelected(event): void {

    let premiereYear = event.target.value;

    if (premiereYear === 'any') {

      premiereYear = '';
    }

    // If we've received wrong value or premiere year didn't change - exit
    if (
      (premiereYear && !this.allPremiereYears.includes(premiereYear))
      || this.premiereYear === premiereYear
    ) {

      return;
    }

    this.premiereYear = premiereYear;

    this.page = 1;

    this.getMovies();
  }
}
