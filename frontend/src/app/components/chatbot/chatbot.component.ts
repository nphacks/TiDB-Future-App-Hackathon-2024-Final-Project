import { Component } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ChatbotService } from '../../services/chatbot.service';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.scss',
  animations: [
    trigger('chatBoxAnimation', [
      state('closed', style({height: '0', marginBottom: '0', overflow: 'hidden' })),
      state('open', style({ height: '60vh', marginBottom: '10px', overflow: 'auto' })),
      transition('closed <=> open', animate('500ms ease-in-out'))
    ]),
    trigger('chatBarAnimation', [
      state('collapsed', style({width: '30vw'})),
      state('expanded', style({width: '95%'})),
      transition('collapsed <=> expanded', animate('500ms ease-in-out'))
    ])
  ]
})
export class ChatbotComponent {
  chatBoxState = 'closed';
  chatBarState = 'collapsed';
  chatMessage = ''

  constructor(private timelineService: ChatbotService) {}

  openChatBox() {
    this.chatBoxState = this.chatBoxState === 'closed' ? 'open' : 'closed';
    this.chatBarState = this.chatBarState === 'collapsed' ? 'expanded' : 'collapsed';
    this.timelineService.chatNews(this.chatMessage).subscribe((res) => {
      // console.log(res)
    })
  }
}
