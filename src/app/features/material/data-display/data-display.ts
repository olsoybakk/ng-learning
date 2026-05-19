import { Component, AfterViewInit, ViewChild, signal } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CodeBlockComponent } from '../../../shared/components/code-block/code-block';
import { DemoCardComponent } from '../../../shared/components/demo-card/demo-card';

interface Element { name: string; symbol: string; weight: number; category: string; }

const ELEMENTS: Element[] = [
  { name: 'Hydrogen', symbol: 'H', weight: 1.008, category: 'nonmetal' },
  { name: 'Helium', symbol: 'He', weight: 4.003, category: 'noble gas' },
  { name: 'Lithium', symbol: 'Li', weight: 6.941, category: 'alkali metal' },
  { name: 'Beryllium', symbol: 'Be', weight: 9.012, category: 'alkaline earth' },
  { name: 'Boron', symbol: 'B', weight: 10.81, category: 'metalloid' },
  { name: 'Carbon', symbol: 'C', weight: 12.01, category: 'nonmetal' },
  { name: 'Nitrogen', symbol: 'N', weight: 14.01, category: 'nonmetal' },
  { name: 'Oxygen', symbol: 'O', weight: 15.99, category: 'nonmetal' },
  { name: 'Fluorine', symbol: 'F', weight: 19.00, category: 'halogen' },
  { name: 'Neon', symbol: 'Ne', weight: 20.18, category: 'noble gas' },
];

@Component({
  selector: 'app-mat-data-display',
  standalone: true,
  imports: [
    MatTableModule, MatSortModule, MatPaginatorModule,
    MatCardModule, MatListModule, MatChipsModule,
    MatIconModule, MatButtonModule, MatDividerModule,
    MatInputModule, MatFormFieldModule,
    CodeBlockComponent, DemoCardComponent,
  ],
  template: `
    <div class="page-header">
      <h1>📊 Data Display</h1>
      <p>MatTable with sorting and pagination, MatCard, and MatList.</p>
    </div>

    <div class="grid-2">
      <app-demo-card title="MatTable with Sort & Pagination" description="Sortable columns and paginated rows">
        <mat-form-field appearance="outline" style="width:100%;margin-bottom:8px">
          <mat-label>Filter</mat-label>
          <input matInput (input)="applyFilter($event)" placeholder="e.g. noble gas" />
        </mat-form-field>

        <table mat-table [dataSource]="dataSource" matSort class="element-table">
          <ng-container matColumnDef="symbol">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Symbol</th>
            <td mat-cell *matCellDef="let e">{{ e.symbol }}</td>
          </ng-container>
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
            <td mat-cell *matCellDef="let e">{{ e.name }}</td>
          </ng-container>
          <ng-container matColumnDef="weight">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Weight</th>
            <td mat-cell *matCellDef="let e">{{ e.weight }}</td>
          </ng-container>
          <ng-container matColumnDef="category">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Category</th>
            <td mat-cell *matCellDef="let e">{{ e.category }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"
            (click)="selected.set(row)" [class.selected-row]="selected()?.name === row.name"></tr>

          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell" [colSpan]="displayedColumns.length" style="text-align:center;padding:16px">
              No data matching "{{ filterValue() }}"
            </td>
          </tr>
        </table>
        <mat-paginator [pageSizeOptions]="[5, 10]" pageSize="5" showFirstLastButtons />
        @if (selected()) {
          <div class="output-box mt-1">Selected: {{ selected()!.name }} ({{ selected()!.symbol }}) — {{ selected()!.weight }}</div>
        }
        <app-code-block [code]="tableCode" />
      </app-demo-card>

      <app-demo-card title="MatCard" description="Content container with header, media, and actions">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Angular Material</mat-card-title>
            <mat-card-subtitle>Component library for Angular</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p style="margin:12px 0">Material Design components built for Angular. Accessible, customizable, and follows Material 3 guidelines.</p>
            <mat-chip-set>
              <mat-chip>M3</mat-chip>
              <mat-chip>A11y</mat-chip>
              <mat-chip>TypeScript</mat-chip>
            </mat-chip-set>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary">LEARN MORE</button>
            <button mat-button>SHARE</button>
          </mat-card-actions>
        </mat-card>
        <app-code-block [code]="cardCode" />
      </app-demo-card>

      <app-demo-card title="MatList" description="List variants: basic, navigation, and with icons">
        <mat-list>
          @for (item of listItems; track item.label) {
            <mat-list-item>
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
              <span matListItemLine>{{ item.description }}</span>
            </mat-list-item>
            <mat-divider />
          }
        </mat-list>
        <app-code-block [code]="listCode" />
      </app-demo-card>
    </div>
  `,
  styles: [`
    .element-table { width: 100%; }
    .selected-row { background: rgba(108, 99, 255, 0.1); }
  `]
})
export class MatDataDisplayComponent implements AfterViewInit {
  displayedColumns = ['symbol', 'name', 'weight', 'category'];
  dataSource = new MatTableDataSource(ELEMENTS);
  selected = signal<Element | null>(null);
  filterValue = signal('');

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.filterValue.set(value);
    this.dataSource.filter = value;
  }

  listItems = [
    { icon: 'star', label: 'Signals', description: 'Fine-grained reactivity' },
    { icon: 'layers', label: 'Standalone components', description: 'No NgModules required' },
    { icon: 'bolt', label: 'Zoneless', description: 'ChangeDetectionStrategy.OnPush' },
    { icon: 'route', label: 'Lazy loading', description: 'loadComponent() routing' },
  ];

  tableCode = `// In component class:
dataSource = new MatTableDataSource(data);

@ViewChild(MatSort) sort!: MatSort;
@ViewChild(MatPaginator) paginator!: MatPaginator;

ngAfterViewInit() {
  this.dataSource.sort = this.sort;
  this.dataSource.paginator = this.paginator;
}

// In template:
<table mat-table [dataSource]="dataSource" matSort>
  <ng-container matColumnDef="name">
    <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
    <td mat-cell *matCellDef="let row">{{ row.name }}</td>
  </ng-container>
  <tr mat-header-row *matHeaderRowDef="columns"></tr>
  <tr mat-row *matRowDef="let row; columns: columns;"></tr>
</table>
<mat-paginator [pageSizeOptions]="[5, 10]" showFirstLastButtons />`;

  cardCode = `<mat-card>
  <mat-card-header>
    <mat-card-title>Card Title</mat-card-title>
    <mat-card-subtitle>Subtitle</mat-card-subtitle>
  </mat-card-header>
  <mat-card-content>
    <p>Content goes here</p>
  </mat-card-content>
  <mat-card-actions>
    <button mat-button color="primary">ACTION</button>
  </mat-card-actions>
</mat-card>`;

  listCode = `<mat-list>
  <mat-list-item>
    <mat-icon matListItemIcon>star</mat-icon>
    <span matListItemTitle>Title</span>
    <span matListItemLine>Secondary line</span>
  </mat-list-item>
  <mat-divider />
</mat-list>`;
}
