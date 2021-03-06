import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChange,
} from '@angular/core';
import { Facet } from '../filter/Facet';

@Component({
  selector: 'y-list-filter',
  templateUrl: './list-filter.component.html',
  styleUrls: ['./list-filter.component.scss'],
})
export class ListFilterComponent implements OnInit, OnChanges {
  @Input() filterState;
  @Input() localStorageKey: string;
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onFilterChanged = new EventEmitter();

  constructor() {}

  ngOnInit() {
    if (!this.filterState) {
      this.filterState = this.createEmptyFilterState();
    }
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    for (const propName in changes) {
      if (propName === 'filterState') {
        if (this.filterState === null || this.filterState === undefined) {
          this.filterState = this.createEmptyFilterState();
        }
        this.autoCorrect();
      }
    }
  }

  createEmptyFilterState() {
    return {
      filters: [],
      facets: [],
      availableFacets: [],
    };
  }

  autoCorrect() {
    if (!this.filterState.filters || !Array.isArray(this.filterState.filters)) {
      this.filterState.filters = [];
    }
    if (!this.filterState.facets || !Array.isArray(this.filterState.facets)) {
      this.filterState.facets = [];
    }
    if (
      !this.filterState.availableFacets ||
      !Array.isArray(this.filterState.availableFacets)
    ) {
      this.filterState.availableFacets = [];
    }
    this.filterState.facets.forEach(facet => {
      let found = false;
      this.filterState.availableFacets.forEach(available => {
        if (facet === available.label) {
          found = true;
        }
      });
      if (!found) {
        this.filterState.availableFacets.push(new Facet(facet, 0));
      }
    });
  }

  filterChange() {
    this.onFilterChanged.emit(this.filterState);
    
    if (this.localStorageKey) {
      this.saveFilterFacets();
    }
  }

  facetSelected(facetLabel) {
    return (
      this.filterState &&
      this.filterState.facets &&
      this.filterState.facets.indexOf(facetLabel) !== -1
    );
  }

  toggleFacet(facetLabel, event) {
    event.stopPropagation();
    if (this.facetSelected(facetLabel)) {
      const index = this.filterState.facets.indexOf(facetLabel);
      this.filterState.facets.splice(index, 1);
    } else {
      this.filterState.facets.push(facetLabel);
    }
    this.filterState = this.filterState;
    this.filterChange();
  }

  hasFacets() {
    return (
      this.filterState.availableFacets &&
      this.filterState.availableFacets.length > 0
    );
  }

  private saveFilterFacets() {
    localStorage.setItem(this.localStorageKey, JSON.stringify(this.filterState.facets));
  }
}
