import { http, HttpResponse } from 'msw'

// Wikipedia "On This Day" — default: returns 3 events per day
export const handlers = [
  http.get('https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/:mm/:dd', () => {
    return HttpResponse.json({
      events: [
        { year: 1969, text: 'Apollo 11 lands on the Moon.', pages: [] },
        { year: 1815, text: 'Napoleon defeated at Waterloo.', pages: [] },
        { year: 2001, text: 'Wikipedia launched.', pages: [] },
      ],
    })
  }),
  // Guardian API — default: returns 2 headlines
  http.get('https://content.guardianapis.com/search', () => {
    return HttpResponse.json({
      response: {
        results: [
          { webPublicationDate: '2005-06-15T00:00:00Z', webTitle: 'A major news event occurred.', webUrl: 'https://theguardian.com/1' },
          { webPublicationDate: '2005-06-16T00:00:00Z', webTitle: 'Another headline from that week.', webUrl: 'https://theguardian.com/2' },
        ],
      },
    })
  }),
]
