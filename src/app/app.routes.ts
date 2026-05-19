import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then(m => m.HomeComponent),
  },
  {
    path: 'angular',
    children: [
      { path: 'signals', loadComponent: () => import('./features/angular/signals/signals').then(m => m.SignalsComponent) },
      { path: 'control-flow', loadComponent: () => import('./features/angular/control-flow/control-flow').then(m => m.ControlFlowComponent) },
      { path: 'reactive-forms', loadComponent: () => import('./features/angular/reactive-forms/reactive-forms').then(m => m.ReactiveFormsComponent) },
      { path: 'pipes', loadComponent: () => import('./features/angular/pipes/pipes').then(m => m.PipesComponent) },
      { path: 'directives', loadComponent: () => import('./features/angular/directives/directives').then(m => m.DirectivesComponent) },
      { path: 'http-client', loadComponent: () => import('./features/angular/http-client/http-client').then(m => m.HttpClientComponent) },
      { path: 'change-detection', loadComponent: () => import('./features/angular/change-detection/change-detection').then(m => m.ChangeDetectionComponent) },
    ]
  },
  {
    path: 'rxjs',
    children: [
      { path: 'subjects', loadComponent: () => import('./features/rxjs/subjects/subjects').then(m => m.SubjectsComponent) },
      { path: 'transform', loadComponent: () => import('./features/rxjs/transform-operators/transform-operators').then(m => m.TransformOperatorsComponent) },
      { path: 'filter', loadComponent: () => import('./features/rxjs/filter-operators/filter-operators').then(m => m.FilterOperatorsComponent) },
      { path: 'combination', loadComponent: () => import('./features/rxjs/combination-operators/combination-operators').then(m => m.CombinationOperatorsComponent) },
      { path: 'error-handling', loadComponent: () => import('./features/rxjs/error-handling/error-handling').then(m => m.ErrorHandlingComponent) },
      { path: 'multicasting', loadComponent: () => import('./features/rxjs/multicasting/multicasting').then(m => m.MulticastingComponent) },
      { path: 'custom-operators', loadComponent: () => import('./features/rxjs/custom-operators/custom-operators').then(m => m.CustomOperatorsComponent) },
    ]
  },
  {
    path: 'material',
    children: [
      { path: 'buttons', loadComponent: () => import('./features/material/buttons/buttons').then(m => m.MatButtonsComponent) },
      { path: 'form-controls', loadComponent: () => import('./features/material/form-controls/form-controls').then(m => m.MatFormControlsComponent) },
      { path: 'data-display', loadComponent: () => import('./features/material/data-display/data-display').then(m => m.MatDataDisplayComponent) },
      { path: 'navigation', loadComponent: () => import('./features/material/navigation/navigation').then(m => m.MatNavigationComponent) },
      { path: 'overlays', loadComponent: () => import('./features/material/overlays/overlays').then(m => m.MatOverlaysComponent) },
    ]
  },
  { path: '**', redirectTo: '' }
];
