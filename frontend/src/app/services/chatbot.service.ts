import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  chatNews(query: string) {
    let params = new HttpParams().set('q', query)
    return this.http.get(this.apiUrl+'/chatbot/chat', { params });
  }
}
