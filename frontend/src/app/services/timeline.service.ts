import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TimelineService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  searchNews(query: string) {
    let params = new HttpParams().set('q', query)
    return this.http.get(this.apiUrl+'/paper/search', { params });
  }

  getTimelineNews(query: string) {
    let params = new HttpParams().set('q', query)
    return this.http.get(this.apiUrl+'/paper/timeline', { params });
  }
}
