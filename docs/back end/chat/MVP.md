- 1 chat (1–1)
- send message
- receive message
- presence: online / offline



	
- **Чаты на старте: только 1:1**
    
- **Сообщения всегда пишем в БД** (иначе offline/unread/история разваливаются)
    
- **Вложения: только текст** (attachments добавим отдельным вертикальным срезом)
    
- **Hubs: один общий** **RealtimeHub** (внутри “каналы” событий) — можно легко разделить позже на ChatHub + NotificationsHub, если захочешь.

signalR доставляет по группам а не по адресам!