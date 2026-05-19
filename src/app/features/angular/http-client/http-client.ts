import { Component, inject, Injectable, signal } from '@angular/core';
import {
  HttpClient, HttpErrorResponse, HttpHandlerFn,
  HttpInterceptorFn, HttpParams, HttpRequest
} from '@angular/common/http';
import { catchError, delay, finalize, map, of, tap, throwError } from 'rxjs';
import { SlicePipe } from '@angular/common';
import { CodeBlockComponent } from '../../../shared/components/code-block/code-block';
import { DemoCardComponent } from '../../../shared/components/demo-card/demo-card';

interface Post { id: number; title: string; userId: number; }

const loggingInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const start = Date.now();
  return next(req).pipe(
    tap(event => {
      if ((event as { status?: number }).status !== undefined) {
        console.log(`[HTTP] ${req.method} ${req.urlWithParams} (${Date.now() - start}ms)`);
      }
    })
  );
};

@Injectable({ providedIn: 'root' })
export class PostsService {
  private http = inject(HttpClient);
  private baseUrl = 'https://jsonplaceholder.typicode.com';

  getPosts(userId?: number) {
    let params = new HttpParams();
    if (userId) params = params.set('userId', userId);
    return this.http.get<Post[]>(`${this.baseUrl}/posts`, { params }).pipe(
      map(posts => posts.slice(0, 5))
    );
  }

  getPost(id: number) {
    return this.http.get<Post>(`${this.baseUrl}/posts/${id}`);
  }

  createPost(post: Partial<Post>) {
    return this.http.post<Post>(`${this.baseUrl}/posts`, post);
  }
}

@Component({
  selector: 'app-http-client',
  standalone: true,
  imports: [CodeBlockComponent, DemoCardComponent, SlicePipe],
  template: `
    <div class="page-header">
      <h1>🌐 HTTP Client</h1>
      <p>Typed requests, <code>HttpParams</code>, functional interceptors, and error handling.</p>
    </div>

    <div class="grid-2">
      <app-demo-card title="GET with HttpParams" description="Fetch typed data with query parameters">
        <div class="controls">
          @for (uid of [1, 2, 3]; track uid) {
            <button class="btn-secondary" (click)="fetchPosts(uid)">User {{ uid }}</button>
          }
          <button class="btn-secondary" (click)="fetchPosts()">All</button>
        </div>
        @if (loading()) { <div class="badge badge-yellow mt-1">⏳ Loading...</div> }
        <div class="output-box mt-1" style="max-height:150px;overflow-y:auto">
          @if (posts().length) {
            @for (p of posts(); track p.id) {
              <div class="output-line" style="font-size:0.8rem">
                #{{ p.id }} — {{ p.title | slice:0:40 }}...
              </div>
            }
          } @else if (!loading()) {
            <span style="color:var(--text-muted)">Click a button to fetch posts</span>
          }
        </div>
        <app-code-block [code]="getCode" />
      </app-demo-card>

      <app-demo-card title="POST — Create Resource" description="Post typed data, get typed response">
        <button class="btn-primary" (click)="createPost()">Create Post</button>
        @if (createdPost()) {
          <div class="output-box mt-1">
            <div style="color:var(--green)">✓ Created!</div>
            <div>id: {{ createdPost()?.id }}</div>
            <div>title: {{ createdPost()?.title }}</div>
          </div>
        }
        <app-code-block [code]="postCode" />
      </app-demo-card>

      <app-demo-card title="Error Handling" description="catchError, HTTP status codes, typed errors">
        <button class="btn-primary" (click)="fetchBad()">Fetch 404</button>
        @if (errorMsg()) {
          <div class="output-box mt-1" style="color:var(--red)">{{ errorMsg() }}</div>
        }
        <app-code-block [code]="errorCode" />
      </app-demo-card>

      <app-demo-card title="Functional Interceptors" description="Add auth headers, logging, retry logic at the transport layer">
        <div class="output-box">
          <div style="color:var(--text-muted)">Every request logs to console:</div>
          <div style="color:var(--green)">[HTTP] GET /posts (42ms)</div>
          <div style="font-size:0.8rem;color:var(--text-muted)">Check browser console after fetching posts</div>
        </div>
        <app-code-block [code]="interceptorCode" />
      </app-demo-card>
    </div>
  `
})
export class HttpClientComponent {
  private svc = inject(PostsService);

  posts = signal<Post[]>([]);
  loading = signal(false);
  createdPost = signal<Post | null>(null);
  errorMsg = signal('');

  fetchPosts(userId?: number) {
    this.loading.set(true);
    this.posts.set([]);
    this.svc.getPosts(userId).pipe(
      delay(400),
      finalize(() => this.loading.set(false))
    ).subscribe(posts => this.posts.set(posts));
  }

  createPost() {
    this.svc.createPost({ title: 'New Post', userId: 1 }).subscribe(p => this.createdPost.set(p));
  }

  fetchBad() {
    inject(HttpClient).get('https://jsonplaceholder.typicode.com/posts/9999999').pipe(
      catchError((err: HttpErrorResponse) => {
        this.errorMsg.set(`${err.status} ${err.statusText}: ${err.message.slice(0, 80)}`);
        return of(null);
      })
    ).subscribe();
  }

  getCode = `// Service
getPosts(userId?: number) {
  let params = new HttpParams();
  if (userId) params = params.set('userId', userId);

  return this.http.get<Post[]>('/api/posts', { params }).pipe(
    map(posts => posts.slice(0, 5))
  );
}`;

  postCode = `createPost(data: Partial<Post>) {
  const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  return this.http.post<Post>('/api/posts', data, { headers });
}

// Component
this.postsService.createPost({ title: 'New Post' })
  .subscribe(created => console.log('id:', created.id));`;

  errorCode = `this.http.get<User>('/api/users/999').pipe(
  catchError((err: HttpErrorResponse) => {
    if (err.status === 404) return of(null);
    if (err.status === 401) this.router.navigate(['/login']);
    return throwError(() => new Error(err.message));
  })
).subscribe();`;

  interceptorCode = `// Functional interceptor (Angular 15+)
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getToken();
  const authReq = req.clone({
    setHeaders: { Authorization: \`Bearer \${token}\` }
  });
  return next(authReq);
};

// Register in providers
provideHttpClient(withInterceptors([authInterceptor, loggingInterceptor]))`;
}
